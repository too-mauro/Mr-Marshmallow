/*
This command changes the prefix for the server. It checks to see if the person
running the command has either the "Manage Server" or "Administrator" permissions
and prevents anyone who doesn't have either from running it.
*/

const fs = require("fs");
const discord = require("discord.js");
const { orange } = require("../../config/bot/colors.json");
const { defaultPrefix } = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "prefix",
        aliases: ["p", "pre"],
        usage: "<prefix>",
        category: "settings",
        description: "Sets the server's prefix."
    },
    run: async (bot, message, args) => {

        if (!message.guild.member(message.author).hasPermission("MANAGE_SERVER") || !message.guild.member(message.author).hasPermission("ADMINISTRATOR")) {
          return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
        }

        let configFile = require(`../../config/server/${message.guild.id}/config.json`);
        const embed = new discord.MessageEmbed()
            .setColor(orange)
            .setTitle(`${bot.user.username} Prefix Settings`);

        if (!args || args.length < 1) {
            embed.setDescription(`Changes the prefix used to call ${bot.user.username}.`);
            embed.addField("Current Prefix:", `\` ${configFile.prefix} \` `);
            embed.addField("To update:", `\`${configFile.prefix}prefix <new prefix>\``);
            embed.addField("Valid Settings:", "`Any text, up to 5 characters (e.g. !)`");

            return message.channel.send({embed});
        }

        configFile.prefix = args.join("");
        if (configFile.prefix.length > 5) {
          embed.addField("Prefix is too long!", "The prefix you're trying to set is longer than 5 characters. Please try setting a shorter prefix.");
          return message.channel.send({embed});
        }

        fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
          if (err) {
            console.log(err);
            return message.channel.send("Something went wrong while trying to set the new prefix! Please try again later.");
          }
        });

        embed.setDescription(`Prefix successfully changed.`);
        embed.addField(`${bot.user.username}'s new prefix:`, `\` ${configFile.prefix} \` `);
        return message.channel.send({embed});
   }
}
