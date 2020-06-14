/*
This command changes the blacklisted word list for the server. It checks to see
if the person running the command has either the "Manage Server" or
"Administrator" permissions and prevents anyone who doesn't have either from
running it.
*/

const fs = require("fs");
const discord = require("discord.js");
const { orange } = require("../../config/bot/colors.json");
const botserverConfig = require("../../config/bot/settings.json");
const defaultBlacklist = require("../../config/bot/defaults/blacklist.json");

module.exports = {
    config: {
        name: "wordfilter",
        aliases: ["wf"],
        usage: "(on) (off) (add <word>) (remove <word>) (purge) (default)",
        category: "settings",
        description: "Sets the server's blacklisted word list. Requires **Manage Server** permission."
    },
    run: async (bot, message, args) => {

      if (!message.guild.member(message.author).hasPermission("MANAGE_GUILD") || !message.guild.member(message.author).hasPermission("ADMINISTRATOR")) {
        return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
      }

      const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
      const serverBlacklist = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/blacklist.json`, 'utf8'));
      const embed = new discord.MessageEmbed()
          .setColor(orange)
          .setTitle(`${bot.user.username} Word Filter Settings`);

      if (args[0] && isNaN(args[0])) { args[0] = args[0].toLowerCase(); }
      switch (args[0]) {
        case 'on':
          if (serverConfig.wordfilter.enabled) {
            embed.setDescription(`**Word Filter already enabled.**`);
            embed.addField(`Word Filter already enabled for this server.`, `If you would like to turn it off, do \`${serverConfig.prefix}wordfilter off\`.`);
            return message.channel.send({embed});
          }
          serverConfig.wordfilter.enabled = true;
          fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
            if (err) {
              console.log(err);
              return message.channel.send("Something went wrong while trying to turn on the Word Filter feature! Please try again later.");
            }
          });

          embed.setDescription(`**Word Filter enabled.**`)
          if (serverBlacklist.wordfilter.length < 1) {
            embed.addField(`The Word Filter feature is now enabled.`, `There are no words in the blacklist right now. Please add some with \`${serverConfig.prefix}wordfilter add <word>\`.`);
          }
          else {
            embed.addField(`The Word Filter feature is now enabled.`, `There are ${serverBlacklist.wordfilter.length} words in the blacklist right now. You can always add some more with \`${serverConfig.prefix}wordfilter add <word>\` or remove with \`${serverConfig.prefix}wordfilter remove <word>\`.`);
          }
          return message.channel.send({embed});

        case 'off':
          if (!serverConfig.wordfilter.enabled) {
            embed.setDescription(`**Word Filter already disabled.**`);
            embed.addField(`The Word Filter feature is already disabled for this server.`, `If you would like to turn it on, do \`${serverConfig.prefix}wordfilter on\`.`);
            return message.channel.send({embed});
          }
          serverConfig.wordfilter.enabled = false;
          fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
            if (err) {
              console.log(err);
              return message.channel.send("Something went wrong while trying to turn off the Word Filter feature! Please try again later.");
            }
          });

          embed.setDescription(`**Word Filter disabled.**`);
          embed.addField(`The Word Filter feature is disabled for this server.`, `If you would like to turn it on again, do \`${serverConfig.prefix}wordfilter on\`.`);
          return message.channel.send({embed});

        case 'add':
          // show general message to add new word to blacklist
          if (!args.slice(1) || args.slice(1).length < 1) {
            let currentBlacklistWords = '';
            if (serverBlacklist.wordfilter.length < 1) {
              embed.addField(`Current Blacklist (${serverBlacklist.wordfilter.length} words):`, "**No blacklisted words set!**");
            }
            else { embed.addField(`Current Blacklist (${serverBlacklist.wordfilter.length} words):`, `${serverBlacklist.wordfilter.join(", ")}`); }
            embed.setDescription(`Adds a new word to the Word Filter blacklist.`)
            .addField("To update:", `\`${serverConfig.prefix}wordfilter add <word>\``);
            return message.channel.send({embed});
          }

          let addBlackWord = args.slice(1).join("").replace(/\n+/g, "").toLowerCase();

          // check if the blacklist is at the maximum and if the word already exists in the blacklist
          if (serverBlacklist.wordfilter.length >= serverConfig.wordfilter.maxBlackListSize) {
            embed.setDescription(`**Word Filter blacklist maximum size reached!**`)
            .addField(`The Word Filter blacklist can only hold up to ${serverConfig.wordfilter.maxBlackListSize} words.`, `Remove some with \`${serverConfig.prefix}wordfilter remove <word>\`.`);
            return message.channel.send({embed});
          }
          else if (serverBlacklist.wordfilter.includes(addBlackWord)) {
            embed.setDescription(`**Word already in blacklist.**`)
            .addField("The word you entered is already in the server's word blacklist.", "Please try again.");
            return message.channel.send({embed});
          }

          // Add the new word to the blacklist and save the new settings to the server's config.json file.
          serverBlacklist.wordfilter.push(addBlackWord);
          fs.writeFile(`./config/server/${message.guild.id}/blacklist.json`, JSON.stringify(serverBlacklist), (err) => {
            if (err) {
              console.log(err);
              return message.channel.send("Something went wrong while trying to add the word to the blacklist! Please try again later.");
            }
          });

          embed.setDescription(`**Word Filter blacklist updated!**`)
          .addField(`The Word Filter blacklist has now been set to: `, `${serverBlacklist.wordfilter.join(", ")}`);
          return message.channel.send({embed});

        case 'remove':
          // show general message to add new word to blacklist
          if (!args.slice(1) || args.slice(1).length < 1) {
            var currentBlacklistWords = '';
            if (serverBlacklist.wordfilter.length < 1) {
              currentBlacklistWords = "**No blacklisted words set!**";
            }
            else { currentBlacklistWords = `${serverBlacklist.wordfilter.join(", ")}`; }
            embed.setDescription(`Adds a new word to the Word Filter blacklist.`)
            .addField(`Current Blacklist (${serverBlacklist.wordfilter.length} words):`, currentBlacklistWords)
            .addField("To update:", `\`${serverConfig.prefix}wordfilter remove <word>\``);
            return message.channel.send({embed});
          }

          let removeBlackWord = args.slice(1).join("").replace(/\n+/g, "");

          // check if the blacklist has at least one word and if the word doesn't exists in the blacklist
          if (serverBlacklist.wordfilter.length < 1) {
            embed.setDescription(`**No words in the Word Filter blacklist!**`)
            .addField(`The Word Filter blacklist doesn't have any words saved!`, `Add some with \`${serverConfig.prefix}wordfilter add <word>\`.`);
            return message.channel.send({embed});
          }
          else if (!serverBlacklist.wordfilter.includes(removeBlackWord)) {
            embed.setDescription(`**Word doesn't exist in the blacklist.**`)
            .addField("The word you entered is not in the server's word blacklist.", "Please try again.");
            return message.channel.send({embed});
          }

          // Remove the new word from the blacklist and save the new settings to the server's config.json file.
          for (let rw = 0; rw < serverBlacklist.wordfilter.length; rw++) {
            if (removeBlackWord == serverBlacklist.wordfilter[rw]) {
              serverBlacklist.wordfilter.splice(rw, 1);
            }
          }
          fs.writeFile(`./config/server/${message.guild.id}/blacklist.json`, JSON.stringify(serverBlacklist), (err) => {
            if (err) {
              console.log(err);
              return message.channel.send("Something went wrong while trying to remove the word from the blacklist! Please try again later.");
            }
          });

          embed.setDescription(`**Word Filter blacklist updated!**`)
          .addField(`The Word Filter blacklist has now been set to: `, `${serverBlacklist.wordfilter.join(", ")}`);
          return message.channel.send({embed});

        case 'warn':
          // show general message to add new word to blacklist
          switch (args[1]) {
            case 'on':
              if (serverConfig.wordfilter.warnings.enabled) {
                embed.setDescription(`**Warning Message already enabled.**`);
                embed.addField(`Warning message already enabled for this server.`, `If you would like to turn it off, do \`${serverConfig.prefix}wordfilter warn off\`.`);
                return message.channel.send({embed});
              }
              serverConfig.wordfilter.warnings.enabled = true;
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to turn on the warning message! Please try again later.");
                }
              });

              embed.setDescription(`**Warning message enabled.**`)
              .addField(`The warning message is now enabled.`, `Users will now get a message when they use a blacklisted word.`);
              return message.channel.send({embed});

            case 'off':
              // turns warning message off
              if (!serverConfig.wordfilter.warnings.enabled) {
                embed.setDescription(`**Warning Message already disabled.**`)
                .addField(`Warning message already disabled for this server.`, `If you would like to turn it on, do \`${serverConfig.prefix}wordfilter warn on\`.`);
                return message.channel.send({embed});
              }
              serverConfig.wordfilter.warnings.enabled = false;
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to turn off the warning message! Please try again later.");
                }
              });

              embed.setDescription(`**Warning message disabled.**`)
              .addField(`The warning message is now disabled.`, `Users will no longer get a message when they use a blacklisted word.`);
              return message.channel.send({embed});
              return;

            case 'message':
              // sets the warning message
              if (!args.slice(2) || args.slice(2).length < 1) {
                embed.setDescription(`Sets the message that will be sent to users when they use blacklisted words.`)
                .addField("Current Warn Message:", serverConfig.wordfilter.warnings.message)
                .addField("To update:", `\`${serverConfig.prefix}wordfilter warn message <message>\``)
                .addField("Pro-Tip!:", `Using "username" in your warn message will ping the user when they use a blacklisted word!`);
                return message.channel.send({embed});
              }
              serverConfig.wordfilter.warnings.message = args.slice(2).join(" ").replace(/\n+/g, "");
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to turn set the warning message! Please try again later.");
                }
              });
              embed.setDescription(`**Warning message set.**`)
              .addField(`Your new warning message:`, serverConfig.wordfilter.warnings.message);
              return message.channel.send({embed});

            default:
              switch (serverConfig.wordfilter.warnings.enabled) {
                case false:
                  embed.addField("Warn User:",  "`disabled`", true);
                  break;
                case true:
                  embed.addField("Warn User:",  "`enabled`", true)
                  .addField("Current Warn Message:", serverConfig.wordfilter.warnings.message, true);
                  break;
                }
              embed.setDescription(`Warns a user when they use a blacklisted word, and sets the message that will be sent to them.`)
              .addField("To update:", `\`${serverConfig.prefix}wordfilter warn on/off/message <message>\``);
              return message.channel.send({embed});
          }

        case 'purge':
          message.channel.send(`**${message.author.username}**, are you *sure* you want to delete all of the blacklisted words for ${message.guild.name}? (y/n)`)
          .then(() => {
            message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y' || response.content === 'no' || response.content === 'n', {
              max: 1,
              time: 10000,
              errors: ['time'],
            })
            .then((collected) => {
              if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
                serverBlacklist.wordfilter = [];
                fs.writeFile(`./config/server/${message.guild.id}/blacklist.json`, JSON.stringify(serverBlacklist), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send("Something went wrong while trying to purge the blacklist! Please try again later.");
                  }
                });
                embed.setDescription(`**Word Filter blacklist purged!**`);
                return message.channel.send({embed});
              }
              if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
                return message.channel.send("The operation's been cancelled.");
              }
            })
            .catch(() => {
              return message.channel.send("Time's up!");
            });
          });
          break;

        case 'default':
          message.channel.send(`**${message.author.username}**, are you *sure* you want to reset the blacklist to the default values *and* reset your warn message? (y/n)`)
          .then(() => {
            message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y' || response.content === 'no' || response.content === 'n', {
              max: 1,
              time: 10000,
              errors: ['time'],
            })
            .then((collected) => {
              if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
                serverBlacklist.wordfilter = defaultBlacklist.blacklist;
                serverConfig.wordfilter.warnings.message = botserverConfig.defaults.warnMessage;
                fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverBlacklist), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send("Something went wrong while trying to reset the blacklist! Please try again later.");
                  }
                });
                fs.writeFile(`./config/server/${message.guild.id}/blacklist.json`, JSON.stringify(serverBlacklist), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send("Something went wrong while trying to reset the blacklist! Please try again later.");
                  }
                });
                embed.setDescription(`**Word Filter blacklist and warn message reset!**`)
                .addField(`Current Blacklist (${serverBlacklist.wordfilter.length} words):`, `${serverBlacklist.wordfilter.join(", ")}`)
                .addField("Current Warn Message:", serverConfig.wordfilter.warnings.message);
                return message.channel.send({embed});
              }
              if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
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
          embed.setDescription(`Turns the Word Filter feature on or off, adds and removes words from the blacklist, sets a warning and message for the user, and purges or resets them to default.`)
          .addField("Change options with:", `on - turns on Word Filter\noff - turns off Word Filter\nadd - adds a word to the blacklist\nremove - removes a word from the blacklist\nwarn - warn the user when they use a blacklisted word\npurge - purges the current blacklist\ndefault - resets the blacklist to the defaults`);
          switch (serverConfig.wordfilter.enabled) {
            case false:
              embed.addField("Word Filter:",  "**disabled**", true);
              break;
            case true:
              embed.addField("Word Filter:",  "**enabled**", true);
              break;
          }
          if (serverBlacklist.wordfilter.length < 1) {
            embed.addField(`Current Blacklist:`, "**No blacklisted words set!**");
          }
          else { embed.addField(`Current Blacklist (${serverBlacklist.wordfilter.length} words):`, `${serverBlacklist.wordfilter.join(", ")}`); }
          switch (serverConfig.wordfilter.warnings.enabled) {
            case false:
              embed.addField("Warn User:",  "**disabled**", true);
              break;
            case true:
              embed.addField("Warn User:",  "**enabled**", true)
              .addField("Current Warn Message:", serverConfig.wordfilter.warnings.message, true);
              break;
          }

          return message.channel.send({embed});
      }

    }
}
