const fs = require("fs");
const discord = require("discord.js");
const { orange } = require("../../config/bot/colors.json");
const { defaultPrefix } = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "settings",
        aliases: ["config"],
        usage: "(option)",
        category: "miscellaneous",
        description: "Sets server-specific settings."
    },
    run: async (bot, message, args) => {

      let configFile = require(`../../config/server/${message.guild.id}/config.json`);
      const embed = new discord.MessageEmbed()
          .setColor(orange)
          .setTitle(`${bot.user.username} Settings`);

      switch (args[0]) {
          case 'prefix':
              if (!args.slice(1) || args.slice(1).length < 1) {
                  embed.setDescription(`Changes the prefix used to call ${bot.user.username}.`);
                  embed.addField("Current Prefix:", `\` ${configFile.prefix} \` `);
                  embed.addField("To update:", `\`${configFile.prefix}settings prefix [new prefix]\``);
                  embed.addField("Valid Settings:", "`Any text, up to 5 characters (e.g. !)`");

                  return message.channel.send({embed});
              }

              configFile.prefix = args.slice(1).join("");
              if (configFile.prefix.length > 5) {
                embed.addField("Prefix is too long!", "The prefix you're trying to set is longer than 5 characters. Please try setting a shorter prefix.");
                return message.channel.send({embed});
              }

              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to set your prefix! Please try again later.");
                }
              });

              embed.setDescription(`Prefix successfully changed.`);
              embed.addField(`${bot.user.username}'s new prefix:`, `\` ${configFile.prefix} \` `);
              return message.channel.send({embed});

          case 'doormat':
              if (!args.slice(1) || args.slice(1).length < 1) {
                  return;   // show general doormat settings
              }
              return;

          case 'corkboard':
              if (!args.slice(1) || args.slice(1).length < 1) {
                  return;   // show general corkboard settings
              }
              return;

          default:
              // show the main settings embed
              embed.setDescription(`Use the command format \`${configFile.prefix}settings <option>\` to view more info about an option.`);
              embed.addField(`Prefix :interrobang:`, `\`${configFile.prefix}settings prefix\``, true);
              embed.addField(`DoorMat :door:`, `\`${configFile.prefix}settings doormat\``, true);
              embed.addField(`CorkBoard :pushpin:`, `\`${configFile.prefix}settings corkboard\``, true);
              embed.setFooter(bot.user.username, bot.user.displayAvatarURL());

              return message.channel.send({embed});
      }
    }
  }
