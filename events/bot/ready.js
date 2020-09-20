/* This event runs whenever the bot starts up. This sets the bot user's status to
"online", sets a game of playing the "help" command, and, if desired, sends a
message to the pre-defined log channel stating the bot user is ready for use. */

const fs = require("fs");
const botConfigFile = JSON.parse(fs.readFileSync("./config/bot/settings.json", "utf8"));
const version = JSON.parse(fs.readFileSync("./package.json")).version;
const { removeEndingZeroes } = require("../../config/bot/util.js");

module.exports = async (bot) => {

  // Set bot's status to online and presence to playing a game of the help command.
  bot.user.setStatus("online");
  bot.user.setActivity(`${botConfigFile.defaults.prefix}help`, { type: 'PLAYING' });
  const startupMessage = botConfigFile.startup.message.replace(/vX/g, `v${removeEndingZeroes(version)}`);
  console.log(startupMessage);

  // Send a startup message to the log channel if the startupMessage flag is set to true in the bot settings file.
  if (botConfigFile.startup.enabled) {
    try { bot.channels.cache.get(botConfigFile.channels.log).send(startupMessage); }
    catch(e) { console.log("Couldn't send the start-up message to the log channel!\n", e); }
  }
}
