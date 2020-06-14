/*
This event fires every time a message is pinned or unpinned in every channel in
every server this bot is in. Specifically, the code below will instantly "pin" a
post to the corresponding server's corkboard channel, if applicable, and only when
that server has "Insta-Pin Mode" on. If a channel doesn't have any pins, this event
will not return anything.
*/

const fs = require("fs");
const discord = require("discord.js");

module.exports = async (bot, channel, time) => {

    // Stop here if this event fires from a DM with the bot. This prevents thrown errors regarding non-existent guilds.
    if (channel.type == "dm") return;

    // Get server's config data with channel.guild.id and use the ID in the file path
    // check if the CorkBoard and Insta-Pin Mode is enabled for the server; if it's not, stop here
    const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${channel.guild.id}/config.json`, 'utf8'));
    if (!serverConfig.corkboard.enabled) return;
    else if (serverConfig.corkboard.pinMode == "democratic") return;

    // Check if the time the pins was updated matches the time the last pin was added to the channel.
    // This ensures this event won't run further if a message was unpinned.
    if (time.getTime() !== channel.lastPinTimestamp) return;

    // Check if the channel is on the server's CorkBoard blacklist. If it is, stop here.
    const serverBlacklist = JSON.parse(fs.readFileSync(`./config/server/${channel.guild.id}/blacklist.json`, 'utf8'));
    if (serverBlacklist.corkboard.includes(channel.id)) return channel.send("Sorry, this channel is blacklisted from the CorkBoard.");

    // Check if channel is NSFW and whether the server allows NSFW pins. If the channel is NSFW and
    // the server doesn't allow NSFW posts, stop here.
    if (!serverConfig.corkboard.allowNSFW && channel.nsfw) return channel.send("Sorry, NSFW channels currently aren't allowed to pin messages to the CorkBoard.");

    // Check if there's a valid corkboard channel, and if the channel is deleted, automatically reset the channel to null.
    if (!serverConfig.corkboard.channelID) return;
    let pinChannel = channel.guild.channels.cache.find(c => c.id === serverConfig.corkboard.channelID);
    if (!pinChannel) {
        serverConfig.corkboard.channelID = null;
        return fs.writeFileSync(`./config/server/${channel.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8');
    }

    // Get the channel's pinned messages, if applicable. The Insta-Pin will only fire if it found at least one message.
    // If there are more than one, it will get the most recently pinned message's data, post it to the corkboard channel, then unpin it
    // from the original channel where it was posted.
    let fetchedPins = await channel.messages.fetchPinned();
    let mostRecentPin = fetchedPins.first();
    if (mostRecentPin) {
        // if the user tries to pin a bot's message, stop here.
        if (mostRecentPin.author.bot) {
          channel.send("Sorry, I can't pin bot messages.").then(msg => {
            if (channel.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")) { mostRecentPin.unpin(); }
            msg.delete({ timeout: 3000 });
          });
          return;
        }

        // Look if there is an image attached. If there is, include it in the embed.
        const image = mostRecentPin.attachments.size > 0 ? await extension(mostRecentPin.attachments.array()[0].url) : '';
        if (image == '' && mostRecentPin.cleanContent.length < 1) return mostRecentPin.channel.send(`Sorry, I can't pin empty messages.`);
        const embed = new discord.MessageEmbed()
          .setColor(mostRecentPin.channel.guild.member(mostRecentPin.author).displayHexColor)
          .setAuthor(`📌 Message Pinned!`)
          .setThumbnail(mostRecentPin.author.displayAvatarURL())
          .addField("Author", mostRecentPin.author, true)
          .addField("Channel", mostRecentPin.channel, true);
          if (mostRecentPin.cleanContent.length > 0) embed.addField("Message", mostRecentPin.cleanContent, false)
          embed.setImage(image)
          .addField("Message", `[Jump to it!](https://discord.com/channels/${mostRecentPin.channel.guild.id}/${mostRecentPin.channel.id}/${mostRecentPin.id})`, true)
          .setTimestamp(new Date())
          .setFooter(bot.user.username, bot.user.displayAvatarURL());
        await pinChannel.send({ embed });

        // Remove the pinned message from the channel.
        if (channel.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")) { mostRecentPin.unpin(); }
        else return channel.send("I couldn't unpin the latest pinned message! Do I have the `Manage Messages` permission...?");
    }
}

// Here we add the extension function to check if there's anything attached to the message.
function extension(attachment) {
  const imageLink = attachment.split('.');
  const typeOfImage = imageLink[imageLink.length - 1];
  const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
  if (!image) return '';
  return attachment;
}
