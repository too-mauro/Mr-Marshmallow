/*
This event runs whenever this bot joins a new server. It creates a new folder
in the config/server directory if one does not already exist, creates a general
config.json file, copies the defaultquotes.json and blacklist.json files from
the config/bot directory for the "quote" command and CorkBoard channel and word
filter settings respectively, and sends a message to the pre-defined log channel
saying that it joined a new server.
*/

const {readFileSync, existsSync} = require("fs");
const {MessageEmbed} = require("discord.js");
const botConfigFile = JSON.parse(readFileSync("./config/bot/settings.json", 'utf8'));
const {green_dark} = require("../../config/bot/colors.json");
const {createServerConfigFiles} = require("../../config/bot/util.js");

module.exports = async (bot, guild) => {

    // Check if the configuration folder already exists. If it doesn't, then create
    // whatever's necessary for the bot to run smoothly.
    if (existsSync(`./config/server/${guild.id}/`)) {
      console.log(`${guild.name} (server ID ${guild.id}) already has configuration data set.`);
    }
    else {
      createServerConfigFiles(botConfigFile, guild.id);
    }

    // Send a message to the console.
    console.log(`Joined ${guild.name} (ID: ${guild.id})!`);

    // Try to send the "Server Joined" message to the log channel.
    try {
      const embed = new MessageEmbed()
        .setColor(green_dark)
        .setTitle(`Joined a Server!`)
        .addField("Name:", `**${guild.name}**`, true)
        .addField("ID:", guild.id, true)
        .addField("Member Count:", guild.memberCount)
        .setThumbnail(guild.iconURL())
        .setFooter(bot.user.username, bot.user.displayAvatarURL());
      bot.channels.cache.get(botConfigFile.channels.log).send({embed});
    }
    catch (err) {
      console.error("Couldn't send the 'joined server' message to the log channel!\n", err);
    }
}
