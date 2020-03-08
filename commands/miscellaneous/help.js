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
        description: "Displays all commands that the bot has."
    },
    run: async (bot, message, args) => {

      // get server's prefix
      var prefix = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`)).prefix;

      const embed = new discord.MessageEmbed()
          .setColor(cyan)
          .setTitle(`${bot.user.username} Help`);

      if (!args || args.length < 1) {
          const categories = readdirSync("./commands/");

          embed.setDescription(`Use the command format \`${prefix}help <command>\` to view more info about a command.\nThe prefix for ${message.guild.name} is \` ${prefix} \``);
          embed.setFooter(`${bot.user.username} | Total Commands: ${bot.commands.size}`, bot.user.displayAvatarURL());

          categories.forEach(category => {
              const dir = bot.commands.filter(c => c.config.category === category);
              const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);
              try {
                  embed.addField(`❯ ${category} [${dir.size}]:`, dir.map(c => `\`${c.config.name}\``).join(" "));
              }
              catch (e) {
                  console.log(e);
              }
          })

          return message.channel.send({embed});
      }
      else {
          let command = bot.commands.get(bot.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase());
          if (!command) {
            embed.setTitle("Invalid command.").setDescription(`Do \`${prefix}help\` for the list of commands.`);
            return message.channel.send({embed});
          }
          command = command.config;

          embed.setDescription(stripIndents`The prefix for ${message.guild.name} is: \` ${prefix} \`\n
          **Command:** ${command.name.slice(0, 1).toUpperCase() + command.name.slice(1)}
          **Description:** ${command.description || "No description provided."}
          **Usage:** ${command.usage ? `\`${prefix}${command.name} ${command.usage}\`` : `\`${prefix}${command.name}\``}
          **Aliases:** ${command.aliases ? command.aliases.join(", ") : "None."}`);

          return message.channel.send({embed});
      }
    }
}
