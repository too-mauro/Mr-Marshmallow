/*
This event runs whenever this bot leaves a server. It just sends a message to
the pre-defined log channel saying that it left a server. Its configuration
data remains.
*/

const { logChannel } = require('../../config/bot/settings.json');
const discord = require("discord.js");
const { red_dark } = require("../../config/bot/colors.json");

module.exports = async (bot, guild) => {

  // Try to send the "left a server" message to the log channel.
  if (!guild.member(bot.user).hasPermission("EMBED_LINKS")) {
    try {
      bot.channels.cache.get(logChannel).send(`**-- LEFT A SERVER --**\n${guild.name} (ID: ${guild.id})`);
    }
    catch (e) {
      console.log("Couldn't send the \"left server\" message to the log channel!\n", e);
    }
  }

  const embed = new discord.MessageEmbed()
      .setColor(red_dark)
      .setTitle(`Left a Server...`)
      .addField("Name:", `**${guild.name}**`, true)
      .addField("ID:", guild.id, true)
      .addField("Member Count:", guild.memberCount)
      .setThumbnail(guild.iconURL())
      embed.setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());

  try {
    bot.channels.cache.get(logChannel).send({embed});
  }
  catch (e) {
    console.log("Couldn't send the \"left server\" message to the log channel!\n", e);
  }
}
