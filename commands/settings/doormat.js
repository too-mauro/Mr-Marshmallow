/*
This command configures the DoorMat feature for the server. It checks to see if
the person running the command has either the "Manage Server" or "Administrator"
permissions and prevents anyone who doesn't have either from running it.
*/

const fs = require("fs");
const discord = require("discord.js");
const { orange } = require("../../config/bot/colors.json");
const { defaultPrefix } = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "doormat",
        aliases: ["dm"],
        usage: "<on/off/channel/welcome/leave>",
        category: "settings",
        description: "Configures the DoorMat feature for this server."
    },
    run: async (bot, message, args) => {

        if (!message.guild.member(message.author).hasPermission("MANAGE_SERVER") || !message.guild.member(message.author).hasPermission("ADMINISTRATOR")) {
          return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
        }

        let configFile = require(`../../config/server/${message.guild.id}/config.json`);
        const embed = new discord.MessageEmbed()
            .setColor(orange)
            .setTitle(`${bot.user.username} DoorMat Settings`);

        switch (args[0]) {
          case 'on':
            if (configFile.dmStatus == true) {
              embed.setDescription(`**DoorMat already enabled.**`);
              embed.addField(`DoorMat already enabled for this server.`, `If you would like to turn it off, do \`${configFile.prefix}doormat off\`.`);
              return message.channel.send({embed});
            }
            configFile.dmStatus = true;
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to turn on the DoorMat feature! Please try again later.");
              }
            });

            embed.setDescription(`**DoorMat enabled.**`);
            if (configFile.dmChannel !== null && !configFile.dmChannel.deleted) {
              embed.addField(`The DoorMat feature is now enabled.`, `A doormat channel has already been set, so you're ready to go!`);
            }
            else {
              embed.addField(`The DoorMat feature is now enabled.`, `A doormat channel has not been set yet, so please set one with \`${configFile.prefix}doormat channel <channel mention>\`.`);
            }
            return message.channel.send({embed});

          case 'off':
            if (configFile.dmStatus == false) {
              embed.setDescription(`**DoorMat already disabled.**`);
              embed.addField(`The DoorMat feature is already disabled for this server.`, `If you would like to turn it on, do \`${configFile.prefix}doormat on\`.`);
              return message.channel.send({embed});
            }
            configFile.dmStatus = false;
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to turn off the DoorMat feature! Please try again later.");
              }
            });

            embed.setDescription(`**DoorMat disabled.**`);
            embed.addField(`The DoorMat feature is disabled for this server.`, `If you would like to turn it on again, do \`${configFile.prefix}doormat on\`.`);
            return message.channel.send({embed});

          case 'channel':
            // Show the general help message for the channel argument.
            if (!args.slice(1) || args.slice(1).length < 1) {
              embed.setDescription(`Sets the channel to send welcome and leave messages.`);
              switch (configFile.dmChannel) {
                case null:
                  embed.addField("Current DoorMat Channel:", `**None set!**`);
                  break;
                default:
                  embed.addField("Current DoorMat Channel:", `<#${configFile.dmChannel}>`);
              }
              embed.addField("To update:", `\`${configFile.prefix}doormat channel <channel name/mention>\``);
              return message.channel.send({embed});
            }

            // Try to find a text channel based on name or channel mention, and if there's no match, let the user know. Otherwise, get its ID.
            if (args[1].startsWith('<@') && args[1].endsWith('>')) {
              embed.setDescription(`Cannot set a user.`);
              embed.addField(`You cannot set a user mention to be the DoorMat channel!`, `Please try again.`, true);
              return message.channel.send({embed});
            }
            else if (args[1].startsWith('<#') && args[1].endsWith('>')) {
              var channelID = args[1].slice(2, args[1].length - 1);  // removes the preceding "<#" and ending ">"
              if (message.guild.channels.cache.get(channelID) == undefined) {
                embed.setDescription(`Cannot set a non-existent channel.`);
                embed.addField(`You cannot set a non-existent channel to be the DoorMat channel!`, `Please try again.`, true);
                return message.channel.send({embed});
              }
              else if (message.guild.channels.cache.get(channelID).type !== 'text') {
                embed.setDescription(`Cannot set non-text channels.`);
                embed.addField(`You cannot set a non-text channel to be the DoorMat channel!`, `Please try again.`, true);
                return message.channel.send({embed});
              }
              configFile.dmChannel = channelID;

              // If the CorkBoard is off, automatically turn it on.
              if (configFile.dmStatus == false) configFile.dmStatus = true;

              // Save the new settings to the server's config.json file.
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to set the DoorMat channel! Please try again later.");
                }
              });

              embed.setDescription(`DoorMat channel set.`);
              embed.addField(`The DoorMat channel has now been set to: `, `<#${configFile.dmChannel}>`);
              return message.channel.send({embed});
            }
            else {
              var channel = message.guild.channels.cache.find(textChannel => textChannel.name === args[1]);
              var id = channel ? channel.id : null;
              if (id == null) {
                embed.setDescription(`No channel found.`);
                embed.addField(`A channel with the name \`${args[1]}\` you entered does not exist!`, `Please try again.`, true);
                return message.channel.send({embed});
              }
              else if (channel.type !== 'text') {
                embed.setDescription(`Cannot set non-text channels.`);
                embed.addField(`You cannot set a non-text channel to be the DoorMat channel!`, `Please try again.`, true);
                return message.channel.send({embed});
              }
              configFile.dmChannel = channel.id;

              // If the CorkBoard is off, automatically turn it on.
              if (configFile.dmStatus == false) configFile.dmStatus = true;

              // Save the new settings to the server's config.json file.
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to set the DoorMat channel! Please try again later.");
                }
              });

              embed.setDescription(`DoorMat channel set.`);
              embed.addField(`The DoorMat channel has now been set to: `, `<#${configFile.dmChannel}>`);
              return message.channel.send({embed});
            }

          case 'welcome':
              if (!args.slice(1) || args.slice(1).length < 1) {
                embed.setDescription(`Sets the welcome message.`);
                embed.addField("Current Welcome Message:", configFile.welcomeMessage);
                embed.addField("To update:", `\`${configFile.prefix}doormat welcome <message>\``);
                embed.addField("Pro-Tip!", "Typing `username` will mention the newly joined user, and `servername` will change to the server's current name.");
                return message.channel.send({embed});
              }
              configFile.welcomeMessage = args.slice(1).join(" ");
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to set the welcome message! Please try again later.");
                }
              });

              embed.setDescription(`DoorMat welcome message set.`);
              embed.addField(`The welcome message has now been set to: `, configFile.welcomeMessage);
              return message.channel.send({embed});

          case 'leave':
            if (!args.slice(1) || args.slice(1).length < 1) {
              embed.setDescription(`Sets the leave message.`);
              embed.addField("Current Leave Message:", configFile.leaveMessage);
              embed.addField("To update:", `\`${configFile.prefix}doormat leave <message>\``);
              embed.addField("Pro-Tip!", "Typing `username` will display the left user's tag, and `servername` will change to the server's current name.");
              return message.channel.send({embed});
            }
            configFile.leaveMessage = args.slice(1).join(" ");
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to set the leave message! Please try again later.");
              }
            });

            embed.setDescription(`DoorMat leave message set.`);
            embed.addField(`The leave message has now been set to: `, configFile.leaveMessage);
            return message.channel.send({embed});

          default:
            // show general doormat settings
            embed.setDescription(`Turns the DoorMat feature on or off, changes the channel to send welcome and leave messages, and changes the messages themselves.`);
            embed.addField("Change options with:", `on - turns on DoorMat\noff - turns off DoorMat\nchannel - sets the DoorMat channel\nwelcome - sets the welcome message\nleave - sets the leave message`);
            switch (configFile.dmStatus) {
              case false:
                embed.addField("DoorMat:",  "`disabled`", true);
                break;
              case true:
                embed.addField("DoorMat:",  "`enabled`", true);
                break;
            }
            switch (configFile.dmChannel) {
              case null:
                embed.addField(`DoorMat Channel: `, `**None set!**`, true);
                break;
              default:
                embed.addField(`DoorMat Channel: `, `<#${configFile.dmChannel}>`, true);
                break;
            }
            embed.addField("Welcome Message: ", `${configFile.welcomeMessage}`);
            embed.addField("Leave Message: ", `${configFile.leaveMessage}`);

            return message.channel.send({embed});
        }
    }
}
