/* This event runs whenever the bot starts up. This sets the bot user's status to
"online", sets a game of playing the "help" command, and, if desired, sends a
message to the pre-defined log channel stating the bot user is ready for use. */

const {readFileSync, readdirSync, statSync} = require("fs");
const botConfigFile = JSON.parse(readFileSync("./config/bot/settings.json", "utf8"));
const version = JSON.parse(readFileSync("./package.json")).version;
const {removeEndingZeroes, createServerConfigFiles} = require("../../config/bot/util.js");

module.exports = async (bot) => {

  // Check if the bot has configuration files for all of its servers.
  // If not, create a new server entry in the config/server directory and create the needed files.
  console.log("Checking if all servers have the necessary configuration files...");
  try {
    let currentServerList = [];
    readdirSync("./config/server/").forEach(dir => {
      if (statSync(`./config/server/${dir}`).isDirectory()) {
        currentServerList.push(dir);
      }
    });
    bot.guilds.cache.forEach((guild) => {
        if (!currentServerList.includes(guild.id)) {
          // create server config files here (right now it doesn't have any)
          createServerConfigFiles(botConfigFile, guild.id);
          console.log(`Server configuration files created for ${guild.name} (ID ${guild.id})!`);
        }
        else {
          // see if you can update any config files that need new elements
          console.log(`${guild.name} (ID ${guild.id}) is all good!`);
        }
    });
    console.log("All servers have their configuration files!");
  }
  catch (err) {
    console.error("Failed to validate server configuration files!\n", err);
  }

  // Set bot's status to online and presence to playing a game of the help command.
  bot.user.setStatus("online");
  bot.user.setActivity(`${botConfigFile.defaults.prefix}help`, { type: "PLAYING" });
  const startupMessage = botConfigFile.startupNotice.message.replace(/<version>/g, `v${removeEndingZeroes(version)}`);
  console.log(startupMessage);

  // Send a startup message to the log channel if the startupMessage flag is set to true in the bot settings file.
  if (botConfigFile.startupNotice.enabled) {
    try {
      bot.channels.cache.get(botConfigFile.channels.log).send(startupMessage);
    }
    catch (err) {
      console.error("Couldn't send the startup message to the log channel!\n", err);
    }
  }

}
