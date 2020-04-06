/*
This event runs whenever this bot joins a new server. It creates a new folder
in the config/server directory, creates a general config.json file and copies
the defaultquotes.json file from the config/bot directory for the "quote"
command, and sends a message to the pre-defined log channel saying that it
joined a new server.
*/

const fs = require("fs");
const botConfigFile = require("../../config/bot/settings.json");
const discord = require("discord.js");
const { green_dark } = require("../../config/bot/colors.json");

module.exports = async (bot, guild) => {

    // Check if the configuration folder already exists. If it doesn't, then create
    // whatever's necessary for the bot to run smoothly.
    if (!fs.existsSync(`./config/server/${guild.id}/`)) {

        // Create the new server's configuration folder
        fs.mkdir(`./config/server/${guild.id}/`, (err) => {
          if (err) console.log(err);
        });

        // Create the config.json file using default data from the bot's settings.json file.
        // By default, the Corkboard uses Democratic Mode instead of InstaPin.
        var configData = {
          prefix: botConfigFile.defaultPrefix,
          dmStatus: false,
          dmChannel: null,
          welcomeMessage: botConfigFile.defaultJoinMessage,
          leaveMessage: botConfigFile.defaultLeaveMessage,
          cbStatus: false,
          cbChannel: null,
          cbPinMode: "democratic",
          cbPinThreshold: botConfigFile.defaultPinThreshold,
          maxQuotes: botConfigFile.defaultMaxQuotes,
          gameInProgress: false
        };
        fs.writeFile(`./config/server/${guild.id}/config.json`, JSON.stringify(configData, null, 1), 'utf8', (err) => {
          if (err) console.log(err);
        });

        // Copy the quotes from defaultQuotes.json into the server's quotes.json file.
        fs.copyFile('./config/bot/defaultquotes.json', `./config/server/${guild.id}/quotes.json`, (err) => {
          if (err) console.log(err);
        });
    }
    else {
      console.log(`The configuration folder already exists for ${guild.name}!`);
    }

    // Try to send the "Server Joined" message to the log channel.
    if (!guild.member(bot.user).hasPermission("EMBED_LINKS")) {
      try {
        bot.channels.cache.get(botConfigFile.logChannel).send(`**-- JOINED A SERVER--**\n${guild.name} (ID: ${guild.id})`);
      }
      catch (e) {
        console.log("Couldn't send the \"joined server\" message to the log channel!\n", e);
      }
    }

    const embed = new discord.MessageEmbed()
        .setColor(green_dark)
        .setTitle(`Joined a Server!`)
        .addField("Name:", `**${guild.name}**`, true)
        .addField("ID:", guild.id, true)
        .addField("Member Count:", guild.memberCount)
        .setThumbnail(guild.iconURL())
        .setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());

    try {
      bot.channels.cache.get(botConfigFile.logChannel).send({embed});
    }
    catch (e) {
      console.log("Couldn't send the \"joined server\" message to the log channel!\n", e);
    }
}