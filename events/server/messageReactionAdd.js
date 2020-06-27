/*
This event fires every time a message in any channel and in any server gets a
new reaction. The code below checks for the pushpin emoji specifically for the
corkboard, if it has been enabled. If a channel is set and Democratic Pin Mode is
on, it will "pin" a message in the corkboard channel once a post receives more
than the server's pin threshold. If the message is already in the corkboard, then
this will update the number of pins the post received to reflect the original post's.
*/

const fs = require('fs');
const discord = require("discord.js");

module.exports = async (bot, reaction, user) => {

    const message = reaction.message;
    if (message.channel.type == "dm") return;

    // check if the CorkBoard and Democratic Pin Mode is enabled for the server; if it's not, stop here
    const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
    if (!serverConfig.corkboard.enabled) return;
    else if (serverConfig.corkboard.pinMode == "instapin") return;

    // If the reaction isn't the pushpin emoji or if the user tries to pin either their own or a bot's message, stop here.
    if (reaction.emoji.name !== '📌') return;
    else if (message.author.bot) {
      message.channel.send(`Sorry ${user}, you can't pin bot messages.`).then(async msg => {
        await reaction.users.remove(user.id);
        msg.delete({ timeout: 3000 });
      });
      return;
    }

    // Check if the channel is on the server's CorkBoard blacklist. If it is, stop here.
    const serverDenyList = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/denylist.json`, 'utf8'));
    if (serverDenyList.corkboard.includes(message.channel.id)) return message.channel.send("Sorry, this channel has been restricted from pinning posts to the CorkBoard.");

    // Check if channel is NSFW and whether the server allows NSFW pins. If the channel is NSFW and
    // the server doesn't allow NSFW posts, stop here.
    if (!serverConfig.corkboard.allowNSFW && message.channel.nsfw) return message.channel.send("Sorry, NSFW channels have been restricted from pinning posts to the CorkBoard.");

    // check if there's a valid corkboard channel, and if the channel is deleted, automatically turn it off and reset the channel to null
    if (!serverConfig.corkboard.channelID) return;
    let pinChannel = message.guild.channels.cache.find(c => c.id === serverConfig.corkboard.channelID);
    if (!pinChannel) {
        serverConfig.corkboard.channelID = null;
        return fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8');
    }

    // look for pinned messages already in the corkboard channel with the message's ID. The try-catch block is necessary in case there are non-embed messages in the CorkBoard channel.
    const fetchedMessages = await pinChannel.messages.fetch({ limit: 100 });
    var pins = undefined;
    try {
      pins = fetchedMessages.find(m => m.embeds[0].footer.text.endsWith(message.id));
    }
    catch (e) {
      console.log(e);
      message.channel.send(`Couldn't find the original pinned message in <#${serverConfig.corkboard.channelID}>! Are there any non-embed messages in there...?`);
    }

    // If there are, update the pin count on the embed.
    if (pins) {
      const pin = pins.embeds[0].author.name.slice(4);
      const foundPin = pins.embeds[0];
      const image = foundPin.image ? await extension(foundPin.image.url) : null;
      const pinMsg = await pinChannel.messages.fetch(pins.id);
      const embed = new discord.MessageEmbed()
        .setColor(foundPin.color)
        .setAuthor(`📌  ${parseInt(pin) + 1}`)
        .setThumbnail(foundPin.thumbnail.url)
        .setTimestamp()
        .setFooter(`${bot.user.username} | ${message.id}`, bot.user.displayAvatarURL());
      for (let i = 0; i < foundPin.fields.length; i++) {
        embed.addField(foundPin.fields[i].name, foundPin.fields[i].value, foundPin.fields[i].inline);
      }
      if (image) { embed.setImage(image); }
      await pinMsg.edit({ embed });
    }
    else {
      /* Otherwise, create a new pinned post.
      If the message doesn't meet the server-defined pin threshold, then stop. */
      if (message.reactions.cache.get('📌').count < serverConfig.corkboard.pinThreshold) return;

      const image = message.attachments.size > 0 ? await extension(message.attachments.array()[0].url) : null;
      const embed = new discord.MessageEmbed()
        .setColor(message.member.displayHexColor)
        .setAuthor(`📌  ${message.reactions.cache.get('📌').count}`)
        .setThumbnail(message.author.displayAvatarURL())
        .addField("Author", message.author, true)
        .addField("Channel", message.channel, true)
        .addField("Message", `[Jump to it!](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`, true)
        .setTimestamp()
        .setFooter(`${bot.user.username} | ${message.id}`, bot.user.displayAvatarURL());
      if (message.cleanContent.length > 0) { embed.addField("Message", message.cleanContent, false); }
      if (image) { embed.setImage(image); }
      await pinChannel.send({ embed });
    }
}

// This is the extension function to check if there's a picture attached to the message. No image will appear on posts with non-images.
function extension(attachment) {
  const imageLink = attachment.split('.');
  const typeOfImage = imageLink[imageLink.length - 1];
  const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
  if (!image) return '';
  return attachment;
}
