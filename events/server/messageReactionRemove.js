/*
This event fires every time a message in any channel and in any server loses a
reaction. The code below checks for the pushpin emoji specifically for the
corkboard, if it has been enabled. If a channel is set and Democratic Pin Mode is
on, it will check if a message is already in the corkboard and updates the number
of pins the post received to reflect the original post's if one's found. If the
post loses all of its pins, the message will be "unpinned" (removed) from the
corkboard channel.
*/

const fs = require('fs');
const discord = require("discord.js");

module.exports = async (bot, reaction, user) => {

    if (reaction.message.channel.type == "dm") return;

    // check if the CorkBoard and  Democratic Pin Mode is enabled for the server; if it's not, stop here
    const message = reaction.message;
    const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
    if (!serverConfig.corkboard.enabled) return;
    else if (serverConfig.corkboard.pinMode == "instapin") return;

    // If the reaction isn't the pushpin emoji, stop here.
    if (reaction.emoji.name !== '📌') return;

    // Check if the channel is on the server's CorkBoard blacklist. If it is, stop here.
    let serverBlacklist = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/blacklist.json`, 'utf8'));
    if (serverBlacklist.corkboard.includes(message.channel.id)) return message.channel.send("Sorry, this channel is blacklisted from the CorkBoard.");

    // Check if channel is NSFW and whether the server allows NSFW pins. If the channel is NSFW and
    // the server doesn't allow NSFW posts, stop here.
    if (!serverConfig.corkboard.allowNSFW && message.channel.nsfw) return message.channel.send("Sorry, NSFW channels currently aren't allowed to pin messages to the CorkBoard.");

    // check if there's a valid corkboard channel, and if the channel is deleted, automatically turn it off and reset the channel to null
    if (!serverConfig.corkboard.channelID) return;
    let pinChannel = message.guild.channels.cache.find(c => c.id === serverConfig.corkboard.channelID);
    if (!pinChannel) {
        serverConfig.corkboard.channelID = null;
        return fs.writeFileSync(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8');
    }

    // look for pinned messages already in the corkboard channel with the message's ID. The try-catch block is necessary in case there are non-embed messages in the CorkBoard channel.
    const fetchedMessages = await pinChannel.messages.fetch({ limit: 100 });
    var pins = undefined;
    try { pins = fetchedMessages.find(m => m.embeds[0].footer.text.endsWith(message.id)); }
    catch (e) {
      console.log(e);
      message.channel.send(`Couldn't find the original pinned message in <#${serverConfig.corkboard.channelID}>! Are there any non-embed messages in there...?`);
    }

    // If there are, update the pin count on the embed.
    if (pins) {
      const pin = pins.embeds[0].author.name.slice(4);
      const foundPin = pins.embeds[0];
      const image = message.attachments.size > 0 ? await extension(message.attachments.array()[0].url) : '';
      const pinMsg = await pinChannel.messages.fetch(pins.id);
      if (!pin || parseInt(pin) - 1 == 0) return pinMsg.delete({ timeout: 1000 });
      const embed = new discord.MessageEmbed()
        .setColor(foundPin.color)
        .setAuthor(`📌  ${parseInt(pin) - 1}`)
        .setThumbnail(foundPin.thumbnail.url);
      for (let i = 0; i < foundPin.fields.length; i++) {
        embed.addField(foundPin.fields[i].name, foundPin.fields[i].value, foundPin.fields[i].inline);
      }
        embed.setImage(image)
        .setTimestamp()
        .setFooter(`${bot.user.username} | ${message.id}`, bot.user.displayAvatarURL());
      await pinMsg.edit({ embed });
    }

}

// Here we add the this.extension function to check if there's anything attached to the message.
function extension(attachment) {
  const imageLink = attachment.split('.');
  const typeOfImage = imageLink[imageLink.length - 1];
  const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
  if (!image) return '';
  return attachment;
}
