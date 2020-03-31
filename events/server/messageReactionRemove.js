const fs = require('fs');
const discord = require("discord.js");

module.exports = async (bot, reaction, user) => {

    // check if corkboard is enabled for the server; if it's not, stop here
    const message = reaction.message;
    const configFile = require(`../../config/server/${message.guild.id}/config.json`);
    if (configFile.cbStatus == false) return;

    // If the reaction isn't the pushpin emoji or if the user tries to pin a bot's message, stop here.
    if (reaction.emoji.name !== '📌') return;

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

    const fetchedMessages = await pinChannel.messages.fetch({ limit: 100 });
    const pins = fetchedMessages.find(m => m.embeds[0].footer.text.endsWith(message.id));
    if (pins) {
      const pin = pins.embeds[0].author.name.slice(4);
      const foundPin = pins.embeds[0];
      const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
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
function extension(reaction, attachment) {
  const imageLink = attachment.split('.');
  const typeOfImage = imageLink[imageLink.length - 1];
  const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
  if (!image) return '';
  return attachment;
}
