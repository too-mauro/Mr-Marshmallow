/*
This event runs whenever this bot joins a new server. It creates a new folder
in the config/server directory, creates a general config.json file and a
quotes.txt file for the "quote" command, and sends a message to the pre-defined
log channel saying that it joined a new server.
*/

const fs = require("fs");
const botConfigFile = require("../../config/bot/settings.json");

module.exports = async (bot, guild) => {

    // Check if the configuration folder already exists. If it doesn't, then create
    // whatever's necessary for the bot to run smoothly.
    if (!fs.existsSync(`./config/server/${guild.id}/`)) {

        // Create the new server's configuration folder
        fs.mkdir(`./config/server/${guild.id}/`, (err) => {
          if (err) console.log(err);
        });

        // Create the config.json file using default data from the bot's settings.json file
        var configData = {
          prefix: botConfigFile.defaultPrefix,
          dmStatus: false,
          dmChannel: null,
          welcomeMessage: botConfigFile.defaultJoinMessage,
          leaveMessage: botConfigFile.defaultLeaveMessage,
          cbStatus: false,
          cbChannel: null,
          cbMinPins: botConfigFile.defaultMinMessagePins,
          maxQuotes: botConfigFile.defaultMaxQuotes,
          gameInProgress: false
        };

        fs.writeFile(`./config/server/${guild.id}/config.json`, JSON.stringify(configData, null, 1), (err) => {
          if (err) console.log(err);
        });

        // Create a blank quotes.txt file; this is used for the "quote" command.
        fs.writeFile(`./config/server/${guild.id}/quotes.txt`, "", (err) => {
          if (err) console.log(err);
        });
    }
    else {
      console.log(`The configuration folder already exists for ${guild.name}!`);
    }

    // Try to send the "joined a server" message to the log channel.
    try {
      bot.channels.cache.get(botConfigFile.logChannel).send(`**-- JOINED A SERVER--**\n${guild.name} (ID: ${guild.id})`);
    }
    catch (e) {
      console.log("Couldn't send the server joined message to the log channel!");
    }
}
