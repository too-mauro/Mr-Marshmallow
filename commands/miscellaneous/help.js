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
        usage: "(command)",
        category: "miscellaneous",
        description: "Displays all the commands that Mr. Marshmallow has to offer."
    },
    run: async (bot, message, args) => {

      // get server's prefix
      const prefix = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8')).prefix;

      const embed = new discord.MessageEmbed()
          .setColor(cyan)
          .setTitle(`${bot.user.username} Help`);

      if (!args || args.length < 1) {
          // Show all commands, organized by category, in one message embed.
          let commandCount = 0;
          embed.setDescription(`Use the command format \`${prefix}help <command>\` to view more info about a command.`);
          const categories = readdirSync("./commands/");
          categories.forEach(category => {
              if (category == 'owner') return;    // <-- don't show owner commands
              const capitalize = category.slice(0, 1).toUpperCase() + category.slice(1);
              const dir = bot.commands.filter(c => c.config.category === category);
              if (dir.size > 0) {
                  embed.addField(`${capitalize} (${dir.size}):`, dir.map(c => `\`${c.config.name}\``).sort().join(" "));
                  commandCount += dir.size;
              }
              else { embed.addField(`${capitalize} (${dir.size}):`, "**No commands in this category!**"); }
          });
          embed.setFooter(`${bot.user.username} | Total Commands: ${commandCount}`, bot.user.displayAvatarURL());
          return message.channel.send({embed});
      }
      else {
          /* Search for a given command name. If there's no result, alert the user that it's an invalid command and check the help message again. Otherwise, show the command name, aliases (if any), usage, and description. */
          let command = bot.commands.get(bot.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase());
          if (!command) {
            embed.setDescription(`**Invalid command or alias**. Do \`${prefix}help\` for the list of commands.`)
            .setFooter(bot.user.username, bot.user.displayAvatarURL());
            return message.channel.send({embed});
          }
          command = command.config;

          embed.setDescription(stripIndents`${message.guild.name}'s prefix is: \` ${prefix} \`\n
          **Command:** ${command.name.slice(0, 1).toUpperCase() + command.name.slice(1)}
          **Description:** ${command.description || "No description provided."}
          **Usage:** ${command.usage ? `\`${prefix}${command.name} ${command.usage}\`` : `\`${prefix}${command.name}\``}
          **Aliases:** ${command.aliases ? command.aliases.join(", ") : "None."}`);
          embed.setFooter(bot.user.username, bot.user.displayAvatarURL());

          return message.channel.send({embed});
      }
    }
}
