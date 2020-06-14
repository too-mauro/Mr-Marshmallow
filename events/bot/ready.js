/*
This event runs whenever the bot starts up. This sets the bot user's status to
"online", sets a game of playing the "help" command, and, if desired, sends a
message to the pre-defined log channel stating the bot user is ready for use.
*/

const fs = require("fs");
const botConfigFile = require("../../config/bot/settings.json");

module.exports = async (bot) => {

  // Get bot's version from the package.json file.
  const version = JSON.parse(fs.readFileSync("./package.json")).version;

  // Set bot's status to online and presence to playing a game of the help command.
//  bot.user.setStatus("online");
//  bot.user.setActivity(`${botConfigFile.defaults.prefix}help`, { type: 'PLAYING' });
  console.log(`${bot.user.username} v${removeEndingZeroes(version)} is online and ready!`);

  // Send a startup message to the log channel if the startupMessage flag is set to true in the bot settings file.
  if (botConfigFile.startupMessageEnabled) {
    try { bot.channels.cache.get(botConfigFile.channels.log).send(`**${bot.user.username} v${removeEndingZeroes(version)}** is online and ready!`); }
    catch(e) { console.log("Couldn't send the start-up message to the log channel!\n", e); }
  }
}

function removeEndingZeroes(version) {
  // If the third digit in the version number is 0, remove it from the string. Otherwise, leave it alone.
  if (version.split(".")[2] == 0) return version.slice(0, version.length - 2);
  return version;
}
