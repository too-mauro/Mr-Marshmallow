/*
This command changes the prefix for the server. It checks to see if the person
running the command has either the "Manage Server" or "Administrator" permissions
and prevents anyone who doesn't have either from running it.
*/

const {readFileSync, writeFile} = require("fs");
const {MessageEmbed} = require("discord.js");
const {orange} = require("../../config/bot/colors.json");
const defaultPrefix = JSON.parse(readFileSync("./config/bot/settings.json", "utf8")).defaults.prefix;

module.exports = {
    config: {
        name: "prefix",
        description: "Sets the server's prefix. Requires **Manage Server** permission.",
        usage: "<prefix>",
        aliases: ["pre"],
        category: "settings"
    },
    run: async (bot, message, args) => {

        if (!message.member.hasPermission("MANAGE_GUILD") || !message.member.hasPermission("ADMINISTRATOR")) {
          return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
        }

        const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
        const embed = new MessageEmbed()
            .setColor(orange)
            .setTitle(`${bot.user.username} Prefix Settings`);

        if (!args || args.length < 1) {
            embed.setDescription(`Changes the prefix used to call ${bot.user.username}.`)
            .addField("Current Prefix:", `\` ${serverConfig.prefix} \` `)
            .addField("To update:", `\`${serverConfig.prefix}prefix <new prefix>\``)
            .addField("Valid Settings:", `\`Any text, up to 5 characters (e.g. ${defaultPrefix})\``);
            return message.channel.send({embed});
        }

        // Set the prefix. In case it's all capital letters, ensure it's lowercase so the bot can be invoked. Without it, the bot can't be called as it changes the prefix's case to lowercase and checks against the server's prefix.
        let prefixToSet = args.join("").toLowerCase();
        if (prefixToSet.length > 5) {
          embed.setDescription("The prefix you're trying to set is longer than 5 characters. Please try setting a shorter prefix.");
          return message.channel.send({embed});
        }

        serverConfig.prefix = prefixToSet;
        writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
          if (err) {
            console.error(err);
            return message.channel.send("Something went wrong while trying to set the new prefix! Please try again later.");
          }
          embed.setDescription(`**Prefix successfully changed.**\n${bot.user.username}'s prefix for this server has been changed to: \` ${serverConfig.prefix} \``);
          return message.channel.send({embed});
        });
   }
}
