/*
This event runs whenever this bot leaves a server. It just sends a message to
the pre-defined log channel saying that it left a server. Its configuration
data remains.
*/

const { logChannel } = require('../../config/bot/settings.json');

module.exports = async (bot, guild) => {

  // Try to send the "left a server" message to the log channel.
  try {
    bot.channels.cache.get(logChannel).send(`**-- LEFT A SERVER --**\n${guild.name} (ID: ${guild.id})`);
  }
  catch (e) {
    console.log("Couldn't send the server left message to the log channel!");
  }
}
