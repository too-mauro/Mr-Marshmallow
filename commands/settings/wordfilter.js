/*
This command changes the restricted word list for the server. It checks to see
if the person running the command has either the "Manage Server" or
"Administrator" permissions and prevents anyone who doesn't have either from
running it.
*/

const {readFileSync, writeFile} = require("fs");
const {MessageEmbed} = require("discord.js");
const {orange} = require("../../config/bot/colors.json");
const botConfigFile = JSON.parse(readFileSync("./config/bot/settings.json", "utf8"));
const defaultDenyList = JSON.parse(readFileSync("./config/bot/defaults/denylist.json", "utf8"));

module.exports = {
    config: {
        name: "wordfilter",
        description: "Changes settings for the server's restricted word list. Requires **Manage Server** permission.",
        usage: "(on) (off) (add <word>) (remove <word>) (warn <on> <off> <message (message)>) (purge) (default)",
        aliases: ["wf"],
        category: "settings"
    },
    run: async (bot, message, args) => {

      if (!message.member.hasPermission("MANAGE_GUILD") || !message.member.hasPermission("ADMINISTRATOR")) {
        return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
      }

      const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
      const serverDenyList = JSON.parse(readFileSync(`./config/server/${message.guild.id}/denylist.json`, "utf8"));
      const embed = new MessageEmbed()
          .setColor(orange)
          .setTitle(`${bot.user.username} Word Filter Settings`);

      if (args[0] && isNaN(args[0])) args[0] = args[0].toLowerCase();
      switch (args[0]) {
        case "on":
          if (serverConfig.wordfilter.enabled) {
            embed.setDescription(`**Word Filter already enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}wordfilter off\`.`);
            return message.channel.send({embed});
          }
          serverConfig.wordfilter.enabled = true;
          writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
            if (err) {
              console.error(err);
              return message.channel.send("Something went wrong while trying to turn on the Word Filter feature! Please try again later.");
            }
          });

          let wordsRestricted = (serverDenyList.wordfilter.length < 1) ? `There are no words in the deny-list right now. Please add some with \`${serverConfig.prefix}wordfilter add <word>\`.` : `There are ${serverDenyList.wordfilter.length} words in the deny-list right now. You can always add some more with \`${serverConfig.prefix}wordfilter add <word>\` or remove with \`${serverConfig.prefix}wordfilter remove <word>\`.`;
          embed.setDescription(`**Word Filter enabled.**\n${wordsRestricted}`);
          return message.channel.send({embed});

        case "off":
          if (!serverConfig.wordfilter.enabled) {
            embed.setDescription(`**Word Filter already disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}wordfilter on\`.`);
            return message.channel.send({embed});
          }
          serverConfig.wordfilter.enabled = false;
          writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
            if (err) {
              console.error(err);
              return message.channel.send("Something went wrong while trying to turn off the Word Filter feature! Please try again later.");
            }
          });

          embed.setDescription(`**Word Filter disabled.**\nIf you would like to turn it on again, do \`${serverConfig.prefix}wordfilter on\`.`);
          return message.channel.send({embed});

        case "add":
          // show general message to add new word to deny-list
          if (!args.slice(1) || args.slice(1).length < 1) {
            embed.setDescription("Adds a new word to the Word Filter deny-list.")
            .addField(`Current Deny-list (${serverDenyList.wordfilter.length} words):`, (serverDenyList.wordfilter.length < 1) ? "**No restricted words set!**" : serverDenyList.wordfilter.join(", "))
            .addField("To update:", `\`${serverConfig.prefix}wordfilter add <word>\``);
            return message.channel.send({embed});
          }

          let addDeniedWord = args.slice(1).join("").replace(/\n+/g, "").toLowerCase();

          // check if the deny-list is at the maximum and if the word already exists in the deny-list
          if (serverDenyList.wordfilter.length >= serverConfig.wordfilter.maxDenyListSize) {
            embed.setDescription("**Word Filter deny-list maximum size reached!**")
            .addField(`The Word Filter deny-list can only hold up to ${serverConfig.wordfilter.maxDenyListSize} words.`, `Remove some with \`${serverConfig.prefix}wordfilter remove <word>\`.`);
            return message.channel.send({embed});
          }
          else if (serverDenyList.wordfilter.includes(addDeniedWord)) {
            embed.setDescription("**Word already in deny-list.** Please try again.");
            return message.channel.send({embed});
          }

          // Add the new word to the deny-list and save the new settings to the server's config.json file.
          serverDenyList.wordfilter.push(addDeniedWord);
          writeFile(`./config/server/${message.guild.id}/denylist.json`, JSON.stringify(serverDenyList), (err) => {
            if (err) {
              console.error(err);
              return message.channel.send("Something went wrong while trying to add the word to the deny-list! Please try again later.");
            }
          });

          embed.setDescription(`**Word Filter deny-list updated!**\nUpdated to: ${serverDenyList.wordfilter.join(", ")}`);
          return message.channel.send({embed});

        case "remove":
          // show general message to add new word to deny-list
          if (!args.slice(1) || args.slice(1).length < 1) {
            embed.setDescription("Removes an existing word from the Word Filter deny-list.")
            .addField(`Current Deny-list (${serverDenyList.wordfilter.length} words):`, (serverDenyList.wordfilter.length < 1) ? "**No restricted words set!**" : serverDenyList.wordfilter.join(", "))
            .addField("To update:", `\`${serverConfig.prefix}wordfilter remove <word>\``);
            return message.channel.send({embed});
          }

          let removeDeniedWord = args.slice(1).join("").replace(/\n+/g, "");

          // check if the deny-list has at least one word and if the word doesn't exists in the deny-list
          if (serverDenyList.wordfilter.length < 1) {
            embed.setDescription(`**No words saved in the Word Filter deny-list!**\nAdd some with \`${serverConfig.prefix}wordfilter add <word>\`.`);
            return message.channel.send({embed});
          }
          else if (!serverDenyList.wordfilter.includes(removeDeniedWord)) {
            embed.setDescription("**Word doesn't exist in the deny-list.**\nPlease try again.");
            return message.channel.send({embed});
          }

          // Remove the new word from the deny-list and save the new settings to the server's config.json file.
          for (let rw = 0; rw < serverDenyList.wordfilter.length; rw++) {
            if (removeDeniedWord == serverDenyList.wordfilter[rw]) {
              serverDenyList.wordfilter.splice(rw, 1);
            }
          }
          writeFile(`./config/server/${message.guild.id}/denylist.json`, JSON.stringify(serverDenyList), (err) => {
            if (err) {
              console.error(err);
              return message.channel.send("Something went wrong while trying to remove the word from the deny-list! Please try again later.");
            }
          });

          embed.setDescription(`**Word Filter deny-list updated!**\nUpdated to: ${serverDenyList.wordfilter.join(", ")}`);
          return message.channel.send({embed});

        case "warn":
          // show general message to add new word to deny-list
          switch (args[1]) {
            case "on":
              if (serverConfig.wordfilter.warnings.enabled) {
                embed.setDescription(`**Warning Message already enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}wordfilter warn off\`.`);
                return message.channel.send({embed});
              }
              serverConfig.wordfilter.warnings.enabled = true;
              writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send("Something went wrong while trying to turn on the warning message! Please try again later.");
                }
              });

              embed.setDescription(`**Warning message enabled.**\nUsers will now get a message when they use a restricted word.`);
              return message.channel.send({embed});

            case "off":
              // turns warning message off
              if (!serverConfig.wordfilter.warnings.enabled) {
                embed.setDescription(`**Warning Message already disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}wordfilter warn on\`.`);
                return message.channel.send({embed});
              }
              serverConfig.wordfilter.warnings.enabled = false;
              writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send("Something went wrong while trying to turn off the warning message! Please try again later.");
                }
              });

              embed.setDescription(`**Warning message disabled.**\nUsers will no longer get a message when they use a restricted word.`);
              return message.channel.send({embed});
              return;

            case "message":
              // sets the warning message
              if (!args.slice(2) || args.slice(2).length < 1) {
                embed.setDescription("Sets the message that will be sent to users when they use restricted words.")
                .addField("Current Warn Message:", serverConfig.wordfilter.warnings.message)
                .addField("To update:", `\`${serverConfig.prefix}wordfilter warn message <message>\``)
                .addField("Pro-Tip!:", "Using `<user>` in your warn message will ping the user when they use a restricted word!");
                return message.channel.send({embed});
              }
              serverConfig.wordfilter.warnings.message = args.slice(2).join(" ").replace(/\n+/g, "");
              writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send("Something went wrong while trying to turn set the warning message! Please try again later.");
                }
              });
              embed.setDescription(`**Warning message set.**`)
              .addField(`Your new warning message:`, serverConfig.wordfilter.warnings.message);
              return message.channel.send({embed});

            case "dm":
            if (serverConfig.wordfilter.warnings.warnType == "dm") {
              embed.setDescription(`**Direct message warnings already enabled.**\nIf you would like to change it, do \`${serverConfig.prefix}wordfilter warn channel\`.`);
              return message.channel.send({embed});
            }
            serverConfig.wordfilter.warnings.warnType = "dm";
            writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.error(err);
                return message.channel.send("Something went wrong while trying to change the warning message setting! Please try again later.");
              }
              embed.setDescription(`**Direct message warnings enabled.**\nIf you would like to change it, do \`${serverConfig.prefix}wordfilter warn channel\`.`);
              return message.channel.send({embed});
            });

            case "channel":
              if (serverConfig.wordfilter.warnings.warnType == "channel") {
                embed.setDescription(`**Server channel warnings already enabled.**\nIf you would like to change it, do \`${serverConfig.prefix}wordfilter warn dm\`.`);
                return message.channel.send({embed});
              }
              serverConfig.wordfilter.warnings.warnType = "channel";
              writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send("Something went wrong while trying to change the warning message setting! Please try again later.");
                }
                embed.setDescription(`**Server channel warnings enabled.**\nIf you would like to change it, do \`${serverConfig.prefix}wordfilter warn dm\`.`);
                return message.channel.send({embed});
              });

            default:
              embed.setDescription("Warns a user when they use a restricted word, and sets the message that will be sent to them.")
              if (serverConfig.wordfilter.warnings.enabled) {
                embed.addField("Warn User:",  "**enabled**", true)
                .addField("Current Warn Type:", serverConfig.wordfilter.warnings.warnType, true)
                .addField("Current Warn Message:", serverConfig.wordfilter.warnings.message, false);
              }
              else embed.addField("Warn User:",  "**disabled**", true);
              embed.addField("To update:", `\`${serverConfig.prefix}wordfilter warn on/off/channel/dm/message <message>\``);
              return message.channel.send({embed});
          }

        case "purge":
          message.channel.send(`**${message.author.username}**, are you *sure* you want to delete all of the restricted words for ${message.guild.name}? (y/n)`)
          .then(() => {
            message.channel.awaitMessages(response => response.author.id == message.author.id && (response.content == "yes" || response.content == "y" || response.content == "no" || response.content == "n"), {
              max: 1,
              time: 10000,
              errors: ["time"],
            })
            .then((collected) => {
              let response = collected.first().content.toLowerCase();
              if (response == "yes" || response == "y") {
                serverDenyList.wordfilter = [];
                writeFile(`./config/server/${message.guild.id}/denylist.json`, JSON.stringify(serverDenyList), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to purge the deny-list! Please try again later.");
                  }
                });
                embed.setDescription(`**Word Filter deny-list purged!**`);
                return message.channel.send({embed});
              }
              if (response == "no" || response == "n") {
                return message.channel.send("The operation's been cancelled.");
              }
            })
            .catch(() => {
              return message.channel.send("Time's up!");
            });
          });
          break;

        case "default":
          message.channel.send(`**${message.author.username}**, are you *sure* you want to reset the deny-list to the default values *and* reset your warn message? (y/n)`)
          .then(() => {
            message.channel.awaitMessages(response => response.author.id == message.author.id && (response.content == "yes" || response.content == "y" || response.content == "no" || response.content == "n"), {
              max: 1,
              time: 10000,
              errors: ["time"],
            })
            .then((collected) => {
              let response = collected.first().content.toLowerCase();
              if (response == "yes" || response == "y") {
                serverDenyList.wordfilter = defaultDenyList.wordfilter;
                serverConfig.wordfilter.warnings.message = botConfigFile.defaults.warnMessage;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to reset the word filter warning message! Please try again later.");
                  }
                });
                writeFile(`./config/server/${message.guild.id}/denylist.json`, JSON.stringify(serverDenyList), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to reset the deny-list! Please try again later.");
                  }
                });
                embed.setDescription(`**Word Filter deny-list and warn message reset!**`)
                .addField(`Current Deny-list (${serverDenyList.wordfilter.length} words):`, serverDenyList.wordfilter.join(", "))
                .addField("Current Warn Message:", serverConfig.wordfilter.warnings.message);
                return message.channel.send({embed});
              }
              if (response == "no" || response == "n") {
                return message.channel.send("The operation's been cancelled.");
              }
            })
            .catch(() => {
              return message.channel.send("Time's up!");
            });
          });
          break;

        default:
          // show general wordfilter settings
          embed.setDescription("Turns the Word Filter feature on or off, adds and removes words from the deny-list, sets a warning and message for the user, and purges or resets them to default.")
          .addField("Change options with:", "on - turns on Word Filter\noff - turns off Word Filter\nadd - adds a word to the deny-list\nremove - removes a word from the deny-list\nwarn - warn the user when they use a restricted word\npurge - purges the current deny-list\ndefault - resets the deny-list to the defaults")
          .addField("Word Filter:", serverConfig.wordfilter.enabled ? "**enabled**" : "**disabled**", true)
          .addField("Current Deny-List:", serverDenyList.wordfilter.length < 1 ? "**No restricted words set!**" : serverDenyList.wordfilter.join(", "));
          if (serverConfig.wordfilter.warnings.enabled) {
            embed.addField("Warn User:",  "**enabled**", true)
            .addField("Current Warn Type:", serverConfig.wordfilter.warnings.warnType, true)
            .addField("Current Warn Message:", serverConfig.wordfilter.warnings.message, false);
          }
          else embed.addField("Warn User:",  "**disabled**", true);
          return message.channel.send({embed});
      }

    }
}
