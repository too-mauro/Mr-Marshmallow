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

    // First, check if the time the pins was updated matches the time the last pin was added to the channel.
    // This ensures this event won't run further if a message was unpinned.
    if (time.getTime() !== channel.lastPinTimestamp) return;
    
    // get server's config data with channel.guild.id and use the ID in the file path
    // check if the CorkBoard and Insta-Pin Mode is enabled for the server; if it's not, stop here
    const configFile = require(`../../config/server/${channel.guild.id}/config.json`);
    if (configFile.cbStatus == false) return;
    else if (configFile.cbPinMode == "democratic") return;

    // check if there's a valid corkboard channel, and if the channel is deleted, automatically turn it off and reset the channel to null
    if (configFile.cbChannel == null) return;
    let pinChannel = channel.guild.channels.cache.find(c => c.id === configFile.cbChannel);
    if (!pinChannel) {
        configFile.cbStatus = false;
        configFile.cbChannel = null;
        fs.writeFile(`./config/server/${channel.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
          if (err) console.log(err);
        });
        return console.log(`CorkBoard feature turned off and channel has been reset for ${channel.guild.name} (ID: ${channel.guild.id})`);
    }

    // Get the channel's pinned messages, if applicable. The Insta-Pin will only fire if it found at least one message.
    // If there are more than one, it will get the most recently pinned message's data, post it to the corkboard channel, then unpin it
    // from the original channel where it was posted.
    let fetchedPins = await channel.messages.fetchPinned();
    let mostRecentPin = fetchedPins.first();
    if (mostRecentPin) {
        // if the user tries to pin a bot's message, stop here.
        if (mostRecentPin.author.bot) return channel.send("Sorry, I can't pin bot messages.");

        const image = mostRecentPin.attachments.size > 0 ? await extension(mostRecentPin.attachments.array()[0].url) : '';
        if (image === '' && mostRecentPin.cleanContent.length < 1) return mostRecentPin.channel.send(`Sorry, I can't pin empty messages.`);
        const embed = new discord.MessageEmbed()
          .setColor(mostRecentPin.channel.guild.member(mostRecentPin.author).displayHexColor)
          .setAuthor(`📌 Message Pinned!`)
          .setThumbnail(mostRecentPin.author.displayAvatarURL())
          .addField("Author", mostRecentPin.author, true)
          .addField("Channel", mostRecentPin.channel, true);
          if (mostRecentPin.cleanContent.length > 0) embed.addField("Message", mostRecentPin.cleanContent, false)
          embed.setImage(image)
          .addField("Message", `[Jump to it!](https://discordapp.com/channels/${mostRecentPin.channel.guild.id}/${mostRecentPin.channel.id}/${mostRecentPin.id})`, true)
          .setTimestamp(new Date())
          .setFooter(bot.user.username, bot.user.displayAvatarURL());
        await pinChannel.send({ embed });

        // Remove the pinned message from the channel.
        mostRecentPin.unpin();
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
