/*
This event runs whenever this bot leaves a server. It just sends a message to
the pre-defined log channel saying that it left a server. Its configuration
data remains.
*/

const { logChannel } = require('../../config/bot/settings.json');

module.exports = async (bot, guild) => {

  /*
  // Try to delete everything within the server's configuration folder
  const configFolder = readdirSync(`./config/server/${guild.id}/`);
  configFolder.forEach(file => {
      try {
          fs.unlinkSync(file);
      }
      catch (e) {
          console.log(e);
      }
  });

  // Try to delete the configuration folder itself
  try {
    fs.unlinkSync(configFolder);
  }
  catch (e) {
    console.log(e);
  }*/

  // Try to send the "left a server" message to the log channel.
  try {
    bot.channels.get(logChannel).send(`**-- LEFT A SERVER --**\n${guild.name} (ID: ${guild.id})`);
  }
  catch (e) {
    console.log("Couldn't send the server left message to the log channel!");
  }
}
