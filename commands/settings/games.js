/*
This command configures game settings for the server. It checks to see if
the person running the command has either the "Manage Server" or "Administrator"
permissions and prevents anyone who doesn't have either from running it.
*/

const {readFileSync, writeFile, writeFileSync} = require("fs");
const {MessageEmbed} = require("discord.js");
const {orange} = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "games",
        description: "Configures game settings for this server. Requires **Manage Server** permission.",
        usage: "(players <number>) (rounds <number>) (challenge <on/off>)",
        aliases: ["g"],
        category: "settings"
    },
    run: async (bot, message, args) => {

      if (!message.member.hasPermission("MANAGE_GUILD") || !message.member.hasPermission("ADMINISTRATOR")) {
        return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
      }

      const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
      const embed = new MessageEmbed()
          .setColor(orange)
          .setTitle(`${bot.user.username} Games Settings`);

      if (args[0] && isNaN(args[0])) args[0] = args[0].toLowerCase();
      switch (args[0]) {
        case "players":
          if (!args[1]) {
              embed.setDescription("Changes the maximum number of players allowed in lobbies on this server.")
              .addField("Current Maximum:", `\` ${serverConfig.games.maxLobbyPlayers} \` `)
              .addField("To update:", `\`${serverConfig.prefix}games players <new value>\``)
              .addField("Valid Settings:", `\`Any number from 5 to 20\``);
              return message.channel.send({embed});
          }

          let maxPlayers = args.slice(1).join("").toLowerCase();
          if (isNaN(maxPlayers)) {
            embed.setDescription("The setting you're trying to enter is not a number. Please try entering a number from 5 to 20.");
            return message.channel.send({embed});
          }
          else if (maxPlayers < 5 || maxPlayers > 20) {
            embed.setDescription("The setting you're trying to enter is outside the allowed range. Please try entering a number from 5 to 20.");
            return message.channel.send({embed});
          }

          serverConfig.games.maxLobbyPlayers = parseInt(maxPlayers);
          writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
            if (err) {
              console.error(err);
              return message.channel.send("Something went wrong while trying to set the new maximum player limit! Please try again later.");
            }
            embed.setDescription(`**Maximum player limit successfully changed.**\nYou can now have up to ${parseInt(maxPlayers)} players in a lobby at a given time.`);
            return message.channel.send({embed});
          });
          break;

        case "rounds":
          if (!args[1]) {
              embed.setDescription("Changes the maximum number of rounds per game.")
              .addField("Current Maximum:", `\` ${serverConfig.games.maxLobbyRounds} \` `)
              .addField("To update:", `\`${serverConfig.prefix}games rounds <new value>\``)
              .addField("Valid Settings:", `\`Any number from 5 to 20\``);
              return message.channel.send({embed});
          }

          let maxRounds = args.slice(1).join("").toLowerCase();
          if (isNaN(maxRounds)) {
            embed.setDescription("The setting you're trying to enter is not a number. Please try entering a number from 5 to 30.");
            return message.channel.send({embed});
          }
          else if (maxRounds < 5 || maxRounds > 30) {
            embed.setDescription("The setting you're trying to enter is outside the allowed range. Please try entering a number from 5 to 30.");
            return message.channel.send({embed});
          }

          serverConfig.games.maxLobbyRounds = parseInt(maxRounds);
          writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
            if (err) {
              console.error(err);
              return message.channel.send("Something went wrong while trying to set the new maximum round limit! Please try again later.");
            }
            embed.setDescription(`**Maximum round limit successfully changed.**\nEach game will now have ${parseInt(maxRounds)} rounds per game.`);
            return message.channel.send({embed});
          });
          break;

          case "challenge":
            switch (args[1]) {
              case "on":
                // turn on message
                if (serverConfig.games.triviaCmEnabled) {
                  embed.setDescription(`**Trivia Challenge Mode already enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}games challenge off\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.games.triviaCmEnabled = true;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to change the default challenge mode value! Please try again later.");
                  }
                });

                embed.setDescription(`**Challenge Mode enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}games challenge off\`.`);
                return message.channel.send({embed});
                break;

              case "off":
                // turn off message
                if (!serverConfig.games.triviaCmEnabled) {
                  embed.setDescription(`**Trivia Challenge Mode already disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}games challenge on\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.games.triviaCmEnabled = false;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to change the default challenge mode value! Please try again later.");
                  }
                });

                embed.setDescription(`**Challenge Mode disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}games challenge on\`.`);
                return message.channel.send({embed});
                break;

              default:
                embed.setDescription("Changes the trivia command's default challenge mode setting.")
                .addField("Current Setting:", serverConfig.games.triviaCmEnabled ? "**on**" : "**off**")
                .addField("To update:", `\`${serverConfig.prefix}games challenge <on/off>\``);
                return message.channel.send({embed});
            }
            break;

        default:
          embed.setDescription("Changes settings to set the maximum number of players and rounds for games.")
          .addField("Change options with:", `players - change the maximum number of players allowed in lobbies\nrounds - change the maximum number of rounds to play during games\nchallenge - toggle trivia's challenge mode on or off`)
          .addField("Maximum Players per Lobby", serverConfig.games.maxLobbyPlayers, true)
          .addField("Maximum Rounds per Game", serverConfig.games.maxLobbyRounds, true)
          .addField("Trivia Challenge Mode", serverConfig.games.triviaCmEnabled ? "**on**" : "**off**", true)
          return message.channel.send({embed});
          break;
      }
    }
}
