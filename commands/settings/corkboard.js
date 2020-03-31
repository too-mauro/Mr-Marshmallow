/*
This is the main settings command, which sets the server's prefix, corkboard, and
corkboard settings. It checks to see if the person running the command has either
the "Manage Server" or "Administrator" permissions and prevents anyone who
doesn't have either from running it.
*/

const fs = require("fs");
const discord = require("discord.js");
const { orange } = require("../../config/bot/colors.json");
const { defaultPrefix } = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "corkboard",
        aliases: ["cb"],
        usage: "<on/off/channel/pins>",
        category: "settings",
        description: "Configures the CorkBoard feature for this server."
    },
    run: async (bot, message, args) => {

        if (!message.guild.member(message.author).hasPermission("MANAGE_SERVER") || !message.guild.member(message.author).hasPermission("ADMINISTRATOR")) {
          return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
        }

        let configFile = require(`../../config/server/${message.guild.id}/config.json`);
        const embed = new discord.MessageEmbed()
            .setColor(orange)
            .setTitle(`${bot.user.username} CorkBoard Settings`);

        switch (args[0]) {
          case 'on':
            if (configFile.cbStatus == true) {
              embed.setDescription(`**CorkBoard already enabled.**`);
              embed.addField(`CorkBoard already enabled for this server.`, `If you would like to turn it off, do \`${configFile.prefix}corkboard off\`.`);
              return message.channel.send({embed});
            }
            configFile.cbStatus = true;
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to turn on the CorkBoard feature! Please try again later.");
              }
            });

            embed.setDescription(`**CorkBoard enabled.**`);
            if (configFile.cbChannel !== null && !configFile.cbChannel.deleted) {
              embed.addField(`The CorkBoard feature is now enabled.`, `A corkboard channel has already been set, so you're ready to go!`);
            }
            else {
              embed.addField(`The CorkBoard feature is now enabled.`, `A corkboard channel has not been set yet, so please set one with \`${configFile.prefix}corkboard channel <channel mention>\`.`);
            }
            return message.channel.send({embed});

          case 'off':
            if (configFile.cbStatus == false) {
              embed.setDescription(`**CorkBoard already disabled.**`);
              embed.addField(`The CorkBoard feature is already disabled for this server.`, `If you would like to turn it on, do \`${configFile.prefix}corkboard on\`.`);
              return message.channel.send({embed});
            }
            configFile.cbStatus = false;
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to turn off the CorkBoard feature! Please try again later.");
              }
            });

            embed.setDescription(`**CorkBoard disabled.**`);
            embed.addField(`The CorkBoard feature is disabled for this server.`, `If you would like to turn it on again, do \`${configFile.prefix}corkboard on\`.`);
            return message.channel.send({embed});

          case 'channel':
            // Show the general help message for the channel argument.
            if (!args.slice(1) || args.slice(1).length < 1) {
              embed.setDescription(`Sets the channel for pinned messages to appear.`);
              switch (configFile.cbChannel) {
                case null:
                  embed.addField("Current CorkBoard Channel:", `**None set!**`);
                  break;
                default:
                  embed.addField("Current CorkBoard Channel:", `<#${configFile.cbChannel}>`);
              }
              embed.addField("To update:", `\`${configFile.prefix}corkboard channel <channel name/mention>\``);
              return message.channel.send({embed});
            }

            // Try to find a text channel based on name, and if there's no match, let the user know. Otherwise, get its ID.
            // Try to find a text channel based on name or channel mention, and if there's no match, let the user know. Otherwise, get its ID.
            if (args[1].startsWith('<@') && args[1].endsWith('>')) {
              embed.setDescription(`Cannot set a user.`);
              embed.addField(`You cannot set a user mention to be the CorkBoard channel!`, `Please try again.`, true);
              return message.channel.send({embed});
            }
            else if (args[1].startsWith('<#') && args[1].endsWith('>')) {
              var channelID = args[1].slice(2, args[1].length - 1);  // removes the preceding "<#" and ending ">"
              if (message.guild.channels.cache.get(channelID) == undefined) {
                embed.setDescription(`Cannot set a non-existent channel.`);
                embed.addField(`You cannot set a non-existent channel to be the CorkBoard channel!`, `Please try again.`, true);
                return message.channel.send({embed});
              }
              else if (message.guild.channels.cache.get(channelID).type !== 'text') {
                embed.setDescription(`Cannot set non-text channels.`);
                embed.addField(`You cannot set a non-text channel to be the CorkBoard channel!`, `Please try again.`, true);
                return message.channel.send({embed});
              }
              configFile.cbChannel = channelID;

              // If the CorkBoard is off, automatically turn it on.
              if (configFile.cbStatus == false) configFile.cbStatus = true;

              // Save the new settings to the server's config.json file.
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to set the CorkBoard channel! Please try again later.");
                }
              });

              embed.setDescription(`CorkBoard channel set.`);
              embed.addField(`The CorkBoard channel has now been set to: `, `<#${configFile.cbChannel}>`);
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
                embed.addField(`You cannot set a non-text channel to be the CorkBoard channel!`, `Please try again.`, true);
                return message.channel.send({embed});
              }
              configFile.cbChannel = channel.id;

              // If the CorkBoard is off, automatically turn it on.
              if (configFile.cbStatus == false) configFile.cbStatus = true;

              // Save the new settings to the server's config.json file.
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to set the CorkBoard channel! Please try again later.");
                }
              });

              embed.setDescription(`CorkBoard channel set.`);
              embed.addField(`The CorkBoard channel has now been set to: `, `<#${configFile.cbChannel}>`);
              return message.channel.send({embed});
            }

          case 'pins':
            if (!args.slice(1) || args.slice(1).length < 1) {
              embed.setDescription(`Sets the minimum number of :pushpin: reactions needed for a post to appear in the CorkBoard channel.`)
              .addField("Pin Threshold:", configFile.cbPinThreshold)
              .addField("To update:", `\`${configFile.prefix}corkboard pins <number>\``);
              return message.channel.send({embed});
            }
            if (isNaN(args.slice(1).join(""))) {
              embed.setDescription(`Non-number value entered.`)
              .addField("In order to set the number of pins, please enter a number!", `Do \`${configFile.prefix}corkboard pins <number>\` to set the pin threshold.`);
              return message.channel.send({embed});
            }
            configFile.cbPinThreshold = parseInt(args.slice(1).join(""));
            if (configFile.cbPinThreshold < 1) {
              embed.setDescription(`Value too low.`)
              .addField("The minimum pin threshold must be 1 or higher.", `Do \`${configFile.prefix}corkboard pins <number>\` to set the pin threshold.`);
              return message.channel.send({embed});
            }
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to set the pin threshold! Please try again later.");
              }
            });

            embed.setDescription(`Minimum Pin Count set.`);
            embed.addField(`The minimum pin count has now been set to: `, configFile.cbPinThreshold);
            return message.channel.send({embed});

          default:
            // show general corkboard settings
            embed.setDescription(`Turns the CorkBoard feature on or off, changes the channel to show pinned messages, and changes the minimum number of pins for a post to show in the pin channel.`);
            embed.addField("Change options with:", `on - turns on CorkBoard\noff - turns off CorkBoard\nchannel - sets the CorkBoard channel\npins - sets the number of pin reactions needed for a post to show in the corkboard channel`);
            switch (configFile.cbStatus) {
              case false:
                embed.addField("CorkBoard:",  "`disabled`", true);
                break;
              case true:
                embed.addField("CorkBoard:",  "`enabled`", true);
                break;
            }
            switch (configFile.cbChannel) {
              case null:
                embed.addField(`CorkBoard Channel: `, `**None set!**`, true);
                break;
              default:
                embed.addField(`CorkBoard Channel: `, `<#${configFile.cbChannel}>`, true);
                break;
            }
            embed.addField("Pin Threshold:", configFile.cbPinThreshold);
            return message.channel.send({embed});
        }
    }
}
