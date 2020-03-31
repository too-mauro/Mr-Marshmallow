/*
This event runs whenever the bot starts up. This sets the bot user's status to
"online", sets a game of playing the "help" command, and, if desired, sends a
message to the pre-defined log channel stating the bot user is ready for use.
*/

const botConfigFile = require('../../config/bot/settings.json');

module.exports = async (bot) => {

  // Set bot's status to online and presence to playing a game of the help command.
  bot.user.setStatus("online");
  bot.user.setActivity(`${botConfigFile.defaultPrefix}help`, { type: 'PLAYING' });

  console.log(`${bot.user.username} is online and ready!`);

  // Send a startup message to the log channel if the startupMessage flag is set to true in the bot settings file.
  if (botConfigFile.startupMessage == true) {
    try {
      bot.channels.cache.get(botConfigFile.logChannel).send(`**${bot.user.username}** is online and ready!`);
    }
    catch(e) {
      console.log("Couldn't send the start-up message to the log channel!\n", e);
    }
  }

}
