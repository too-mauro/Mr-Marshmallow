/*
This command configures the DoorMat feature for the server. It checks to see if
the person running the command has either the "Manage Server" or "Administrator"
permissions and prevents anyone who doesn't have either from running it.
*/

const {readFileSync, writeFile} = require("fs");
const {MessageEmbed} = require("discord.js");
const {orange} = require("../../config/bot/colors.json");
const {defaultPrefix} = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "doormat",
        description: "Configures the DoorMat feature for this server. Requires **Manage Server** permission.",
        usage: "(on) (off) (channel <channel>) (welcome <message>) (leave <message>) (ban <message>)",
        aliases: ["dm"],
        category: "settings"
    },
    run: async (bot, message, args) => {

        if (!message.member.hasPermission("MANAGE_GUILD") || !message.member.hasPermission("ADMINISTRATOR")) {
          return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
        }

        const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
        let demoWelcome = serverConfig.doormat.welcomeMessage;
        let demoLeave = serverConfig.doormat.leaveMessage;
        let demoBan = serverConfig.doormat.banMessage;
        const embed = new MessageEmbed()
            .setColor(orange)
            .setTitle(`${bot.user.username} DoorMat Settings`);

        if (args[0] && isNaN(args[0])) args[0] = args[0].toLowerCase();
        switch (args[0]) {
          case "on":
            if (serverConfig.doormat.enabled) {
              embed.setDescription(`**DoorMat already enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}doormat off\`.`);
              return message.channel.send({embed});
            }
            serverConfig.doormat.enabled = true;
            writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.error(err);
                return message.channel.send("Something went wrong while trying to turn on the DoorMat feature! Please try again later.");
              }
            });

            let channelSet = (serverConfig.doormat.channelID && !serverConfig.doormat.channelID.deleted) ? "A doormat channel has already been set, so you're ready to go!" : `A doormat channel has not been set yet, so please set one with \`${serverConfig.prefix}doormat channel <channel mention>\`.`;
            embed.setDescription(`**DoorMat enabled.**\n${channelSet}`);
            return message.channel.send({embed});

          case "off":
            if (!serverConfig.doormat.enabled) {
              embed.setDescription(`**DoorMat already disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}doormat on\`.`);
              return message.channel.send({embed});
            }
            serverConfig.doormat.enabled = false;
            writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.error(err);
                return message.channel.send("Something went wrong while trying to turn off the DoorMat feature! Please try again later.");
              }
            });

            embed.setDescription(`**DoorMat disabled.**\nIf you would like to turn it on again, do \`${serverConfig.prefix}doormat on\`.`);
            return message.channel.send({embed});

          case "channel":
            // Show the general help message for the channel argument.
            if (!args.slice(1) || args.slice(1).length < 1) {
              embed.setDescription("Sets the channel to send welcome, leave, and ban messages.")
              .addField("Current DoorMat Channel:", serverConfig.doormat.channelID ? `<#${serverConfig.doormat.channelID}>` : `**None set!**`)
              .addField("To update:", `\`${serverConfig.prefix}doormat channel <channel name/mention>\``);
              return message.channel.send({embed});
            }

            // Try to find a text channel based on name or channel mention, and if there's no match, let the user know. Otherwise, get its ID.
            if (args[1].startsWith("<@") && args[1].endsWith(">")) {
              embed.setDescription("You cannot set a user mention to be the DoorMat channel! Please try again.");
              return message.channel.send({embed});
            }
            else if (args[1].startsWith("<#") && args[1].endsWith(">")) {
              let channelID = args[1].slice(2, args[1].length - 1);  // removes the preceding "<#" and ending ">"
              if (!message.guild.channels.cache.get(channelID)) {
                embed.setDescription("You cannot set a non-existent channel to be the DoorMat channel! Please try again.");
                return message.channel.send({embed});
              }
              else if (message.guild.channels.cache.get(channelID).type !== "text") {
                embed.setDescription("You cannot set a non-text channel to be the DoorMat channel! Please try again.");
                return message.channel.send({embed});
              }
              serverConfig.doormat.channelID = channelID;

              // If the CorkBoard is off, automatically turn it on.
              if (!serverConfig.doormat.enabled) serverConfig.doormat.enabled = true;

              // Save the new settings to the server's config.json file.
              writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send("Something went wrong while trying to set the DoorMat channel! Please try again later.");
                }
              });

              embed.setDescription(`DoorMat channel now set to:\n<#${serverConfig.doormat.channelID}>`);
              return message.channel.send({embed});
            }
            else {
              let channel = message.guild.channels.cache.find(textChannel => textChannel.name === args[1].toLowerCase());
              let id = channel ? channel.id : null;
              if (!id) {
                embed.setDescription(`A channel with the name \`${args[1]}\` you entered does not exist! Please try again.`);
                return message.channel.send({embed});
              }
              else if (channel.type !== "text") {
                embed.setDescription("You cannot set a non-text channel to be the DoorMat channel! Please try again.");
                return message.channel.send({embed});
              }
              serverConfig.doormat.channelID = channel.id;

              // If the CorkBoard is off, automatically turn it on.
              if (!serverConfig.doormat.enabled) serverConfig.doormat.enabled = true;

              // Save the new settings to the server's config.json file.
              writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send("Something went wrong while trying to set the DoorMat channel! Please try again later.");
                }
              });

              embed.setDescription(`DoorMat channel now been set to:\n<#${serverConfig.doormat.channelID}>`);
              return message.channel.send({embed});
            }

          case "welcome":
              if (!args.slice(1) || args.slice(1).length < 1) {
                demoWelcome = demoWelcome.replace(/<user>/g, message.author).replace(/<server>/g, `**${message.guild}**`);
                if (message.guild.rulesChannel) demoWelcome = demoWelcome.replace(/<rules>/g, message.guild.rulesChannel);
                embed.setDescription("Sets the welcome message.")
                .addField("Current Welcome Message:", serverConfig.doormat.welcomeMessage)
                .addField("Welcome Message will look like this when someone joins:", demoWelcome)
                .addField("To update:", `\`${serverConfig.prefix}doormat welcome <message>\``)
                .addField("Quick Tip!", "`<user>` - will mention the newly joined user\n`<server>` - will display the server's current name\n`<rules>` - will mention the server's rules channel (if one has been set)");
                return message.channel.send({embed});
              }
              serverConfig.doormat.welcomeMessage = args.slice(1).join(" ");
              writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send("Something went wrong while trying to set the welcome message! Please try again later.");
                }
              });

              embed.setDescription(`DoorMat welcome message now been set to:\n${serverConfig.doormat.welcomeMessage}`);
              return message.channel.send({embed});

          case "leave":
            if (!args.slice(1) || args.slice(1).length < 1) {
              demoLeave = demoLeave.replace(/<user>/g, `**${message.author.tag}**`).replace(/<server>/g, `**${message.guild.name}**`);
              embed.setDescription("Sets the leave message.")
              .addField("Current Leave Message:", serverConfig.doormat.leaveMessage)
              .addField("Leave Message will look like this when someone leaves:", demoLeave)
              .addField("To update:", `\`${serverConfig.prefix}doormat leave <message>\``)
              .addField("Quick Tip!", "`<user>` - will display the tag of the user who left\n`<server>` - will display the server's current name");
              return message.channel.send({embed});
            }
            serverConfig.doormat.leaveMessage = args.slice(1).join(" ");
            writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.error(err);
                return message.channel.send("Something went wrong while trying to set the leave message! Please try again later.");
              }
            });

            embed.setDescription(`DoorMat leave message now been set to:\n${serverConfig.doormat.leaveMessage}`);
            return message.channel.send({embed});

          case "ban":
            if (!args.slice(1) || args.slice(1).length < 1) {
              demoBan = demoBan.replace(/<user>/g, `**${message.author.tag}**`).replace(/<server>/g, `**${message.guild.name}**`);
              embed.setDescription("Sets the ban message.")
              .addField("Current Ban Message:", serverConfig.doormat.banMessage)
              .addField("Ban Message will look like this when someone is banned:", demoBan)
              .addField("To update:", `\`${serverConfig.prefix}doormat ban <message>\``)
              .addField("Quick Tip!", "`<user>` - will display the banned user's tag\n`<server>` - will display the server's current name");
              return message.channel.send({embed});
            }
            serverConfig.doormat.banMessage = args.slice(1).join(" ");
            writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.error(err);
                return message.channel.send("Something went wrong while trying to set the ban message! Please try again later.");
              }
            });

            embed.setDescription(`DoorMat ban message now been set to:\n${serverConfig.doormat.banMessage}`);
            return message.channel.send({embed});

          default:
            // show general doormat settings
            embed.setDescription("Turns the DoorMat feature on or off, changes the channel to send welcome, leave, and ban messages, and changes the messages themselves.")
            .addField("Change options with:", "on - turns on DoorMat\noff - turns off DoorMat\nchannel - sets the DoorMat channel\nwelcome - sets the welcome message\nleave - sets the leave message\nban - sets the ban message")
            .addField("DoorMat:", serverConfig.doormat.enabled ? "**enabled**" : "**disabled**", true)
            .addField(`DoorMat Channel: `, serverConfig.doormat.channelID ? `<#${serverConfig.doormat.channelID}>` : `**None set!**`, true)
            .addField("Welcome Message: ", `${serverConfig.doormat.welcomeMessage}`)
            .addField("Leave Message: ", `${serverConfig.doormat.leaveMessage}`)
            .addField("Ban Message: ", `${serverConfig.doormat.banMessage}`);
            return message.channel.send({embed});
        }
    }
}
