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

    // check if the CorkBoard and Democratic Pin Mode is enabled for the server; if it's not, stop here
    const message = reaction.message;
    const configFile = require(`../../config/server/${message.guild.id}/config.json`);
    if (configFile.cbStatus == false) return;
    else if (configFile.cbPinMode == "instapin") return;

    // If the reaction isn't the pushpin emoji or if the user tries to pin either their own or a bot's message, stop here.
    if (reaction.emoji.name !== '📌') return;
    else if (message.author.bot) {
      message.channel.send(`Sorry ${user}, you can't pin bot messages.`).then(async msg => {
        await reaction.users.remove(user.id);
        msg.delete({ timeout: 3000 });
      });
      return;
    }

    // check if there's a valid corkboard channel, and if the channel is deleted, automatically turn it off and reset the channel to null
    if (configFile.cbChannel == null) return;
    let pinChannel = message.guild.channels.cache.find(c => c.id === configFile.cbChannel);
    if (!pinChannel) {
        configFile.cbStatus = false;
        configFile.cbChannel = null;
        fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
          if (err) console.log(err);
        });
        return console.log(`CorkBoard feature turned off and channel has been reset for ${message.guild.name} (ID: ${message.guild.id})`);
    }

    // look for pinned messages already in the corkboard channel with the message's ID.
    const fetchedMessages = await pinChannel.messages.fetch({ limit: 100 });
    let pins;
    try {
      pins = fetchedMessages.find(m => m.embeds[0].footer.text.endsWith(message.id));
    }
    catch (e) {
      console.log(e);
      message.channel.send(`Couldn't find the original pinned message in <#${configFile.cbChannel}>! Are there any non-embed messages in there...?`);
      pins = undefined;
    }

    // If there are, update the pin count on the embed.
    if (pins) {
      const pin = pins.embeds[0].author.name.slice(4);
      const foundPin = pins.embeds[0];
      const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
      const embed = new discord.MessageEmbed()
        .setColor(foundPin.color)
        .setAuthor(`📌  ${parseInt(pin) + 1}`)
        .setThumbnail(foundPin.thumbnail.url);
      for (let i = 0; i < foundPin.fields.length; i++) {
        embed.addField(foundPin.fields[i].name, foundPin.fields[i].value, foundPin.fields[i].inline);
      }
        embed.setTimestamp()
        .setImage(image)
        .setFooter(`${bot.user.username} | ${message.id}`, bot.user.displayAvatarURL());
      const pinMsg = await pinChannel.messages.fetch(pins.id);
      await pinMsg.edit({ embed });
    }
    else {
      // Otherwise, create a new pinned post.
      // If the message doesn't meet the server-defined pin threshold, then stop.
      if (message.reactions.cache.get('📌').count < configFile.cbPinThreshold) return;

      const image = message.attachments.size > 0 ? await extension(message.attachments.array()[0].url) : '';
      if (image === '' && message.cleanContent.length < 1) return message.channel.send(`**${user.username}**, you cannot pin an empty message.`);
      const embed = new discord.MessageEmbed()
        .setColor(message.guild.member(message.author).displayHexColor)
        .setAuthor(`📌  ${message.reactions.cache.get('📌').count}`)
        .setThumbnail(message.author.displayAvatarURL())
        .addField("Author", message.author, true)
        .addField("Channel", message.channel, true);
        if (message.cleanContent.length > 0) embed.addField("Message", message.cleanContent, false)
        embed.setImage(image)
        .addField("Message", `[Jump to it!](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`, true)
        .setTimestamp(new Date())
        .setFooter(`${bot.user.username} | ${message.id}`, bot.user.displayAvatarURL());
      await pinChannel.send({ embed });

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
