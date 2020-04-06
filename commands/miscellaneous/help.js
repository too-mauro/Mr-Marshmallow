/*
This command shows all the commands the bot currently offers. Without an argument,
it shows all of them by category, and shows more information about each if used
as an argument.
*/

const fs = require("fs");
const discord = require("discord.js");
const { readdirSync } = require("fs");
const { stripIndents } = require("common-tags");
const { cyan } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "help",
        aliases: ["h", "commands"],
        usage: ["(command)"],
        category: "miscellaneous",
        description: "Displays all the commands that Mr. Marshmallow has to offer."
    },
    run: async (bot, message, args) => {

      // get server's prefix
      var prefix = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`)).prefix;

      const embed = new discord.MessageEmbed()
          .setColor(cyan)
          .setTitle(`${bot.user.username} Help`);

      if (!args || args.length < 1) {
          let commandCount = 0;

          const categories = readdirSync("./commands/");
          embed.setDescription(`Use the command format \`${prefix}help <command>\` to view more info about a command.\nThe prefix for ${message.guild.name} is \` ${prefix} \``);

          categories.forEach(category => {
              const capitalize = category.slice(0, 1).toUpperCase() + category.slice(1);
              const dir = bot.commands.filter(c => c.config.category === category);
              if (category == 'owner' || category == 'secret') return;    // <-- don't show owner commands and don't reprint secret commands
              if (dir.size > 0) {
                  embed.addField(`${capitalize} (${dir.size}):`, dir.map(c => `\`${c.config.name}\``).sort().join(" "));
                  commandCount += dir.size;
              }
              else {
                  embed.addField(`${capitalize}`, "**No commands in this category!**");
              }
          });
          embed.setFooter(`${bot.user.username} | Total Commands: ${commandCount}`, bot.user.displayAvatarURL());
          return message.channel.send({embed});
      }
      else {
          let command = bot.commands.get(bot.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase());
          if (!command) {
            embed.setDescription(`**Invalid command**. Do \`${prefix}help\` for the list of commands.`).setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());
            return message.channel.send({embed});
          }
          command = command.config;


          if (command.usage.length > 0) {
            var usage = '';
            for (let u = 0; u < command.usage.length - 1; u++) {
              usage += `\`${prefix}${command.name} ${command.usage[u]}\`, `;
            }
            usage += `\`${prefix}${command.name} ${command.usage[command.usage.length - 1]}\``;
          }

          embed.setDescription(stripIndents`The prefix for ${message.guild.name} is: \` ${prefix} \`\n
          **Command:** ${command.name.slice(0, 1).toUpperCase() + command.name.slice(1)}
          **Description:** ${command.description || "No description provided."}
          **Usage:** ${usage || `\`${prefix}${command.name}\``}
          **Aliases:** ${command.aliases ? command.aliases.join(", ") : "None."}`);
          embed.setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());

          return message.channel.send({embed});
      }
    }
}
