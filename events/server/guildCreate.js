/*
This event runs whenever this bot joins a new server. It creates a new folder
in the config/server directory if one does not already exist, creates a general
config.json file, copies the defaultquotes.json and blacklist.json files from
the config/bot directory for the "quote" command and CorkBoard channel and word
filter settings respectively, and sends a message to the pre-defined log channel
saying that it joined a new server.
*/

const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const botConfigFile = JSON.parse(fs.readFileSync("./config/bot/settings.json", 'utf8'));
const { green_dark } = require("../../config/bot/colors.json");

module.exports = async (bot, guild) => {

    // Check if the configuration folder already exists. If it doesn't, then create
    // whatever's necessary for the bot to run smoothly.
    if (fs.existsSync(`./config/server/${guild.id}/`)) {
      console.log(`${guild.name} (server ID ${guild.id}) already has configuration data set.`);
    }
    else {
      // Create the new server's configuration folder
      fs.mkdirSync(`./config/server/${guild.id}/`);

      // Create the config.json file using default data from the bot's settings.json file.
      // This handles the server's prefix, DoorMat, CorkBoard, and word filter settings.
      const serverConfig = {
        prefix: botConfigFile.defaults.prefix,
        doormat: {
          enabled: false,
          channelID: null,
          welcomeMessage: botConfigFile.defaults.joinMessage,
          leaveMessage: botConfigFile.defaults.leaveMessage,
          banMessage: botConfigFile.defaults.banMessage
        },
        corkboard: {
          enabled: false,
          channelID: null,
          pinMode: botConfigFile.defaults.pinMode,
          pinThreshold: botConfigFile.defaults.pinThreshold,
          allowNSFW: false,
          maxDenyListSize: botConfigFile.defaults.maxDenyListSize
        },
        wordfilter: {
          enabled: false,
          maxDenyListSize: botConfigFile.defaults.maxDenyListSize,
          warnings: {
            enabled: false,
            message: botConfigFile.defaults.warnMessage,
            warnType: botConfigFile.defaults.warnType
          }
        },
        music: {
          nowPlayingEnabled: true,
          embedEnabled: true
        },
        games: {
          triviaInProgress: false,
          riddlesInProgress: false
        },
        maxQuotes: botConfigFile.defaults.maxQuotes
      };
      fs.writeFileSync(`./config/server/${guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8');

      // Copy the default denylist.json file into the server's configuration folder. This file handles the non-allowed words and CorkBoard channels for the server.
      fs.copyFileSync("./config/bot/defaults/denylist.json", `./config/server/${guild.id}/denylist.json`);

      // Copy the default quotes.json file into the server's quotes.json file.
      fs.copyFileSync("./config/bot/defaults/quotes.json", `./config/server/${guild.id}/quotes.json`);

      // Write a file for the server's music queue.
      fs.writeFileSync(`./config/server/${guild.id}/music.json`, JSON.stringify({queue:[]}, null, 0), 'utf8');
    }

    // Send a message to the console.
    console.log(`Joined ${guild.name} (ID: ${guild.id})!`);

    // Try to send the "Server Joined" message to the log channel.
    const embed = new MessageEmbed()
        .setColor(green_dark)
        .setTitle(`Joined a Server!`)
        .addField("Name:", `**${guild.name}**`, true)
        .addField("ID:", guild.id, true)
        .addField("Member Count:", guild.memberCount)
        .setThumbnail(guild.iconURL())
        .setFooter(bot.user.username, bot.user.displayAvatarURL());

    try { bot.channels.cache.get(botConfigFile.channels.log).send({embed}); }
    catch (e) { console.log("Couldn't send the 'joined server' message to the log channel!\n", e); }
}
