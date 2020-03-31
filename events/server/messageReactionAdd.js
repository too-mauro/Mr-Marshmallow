const fs = require('fs');
const discord = require("discord.js");

module.exports = async (bot, reaction, user) => {

    // check if corkboard is enabled for the server; if it's not, stop here
    const message = reaction.message;
    const configFile = require(`../../config/server/${message.guild.id}/config.json`);
    if (configFile.cbStatus == false) return;

    // If the reaction isn't the pushpin emoji or if the user tries to pin a bot's message, stop here.
    if (reaction.emoji.name !== '📌') return;
    if (message.author.bot) return message.channel.send(`Sorry **${user.username}**, you cannot pin bot messages.`);

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
    const pins = fetchedMessages.find(m => m.embeds[0].footer.text.endsWith(message.id));

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

      const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
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

// Here we add the this.extension function to check if there's anything attached to the message.
function extension(reaction, attachment) {
  const imageLink = attachment.split('.');
  const typeOfImage = imageLink[imageLink.length - 1];
  const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
  if (!image) return '';
  return attachment;
}
