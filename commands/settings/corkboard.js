/*
This is the main settings command, which sets the server's prefix, corkboard, and
corkboard settings. It checks to see if the person running the command has either
the "Manage Server" or "Administrator" permissions and prevents anyone who
doesn't have either from running it.
*/

const fs = require("fs");
const discord = require("discord.js");
const { orange } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "corkboard",
        aliases: ["cb"],
        usage: "(on) (off) (channel <channel>) (pins <number>) (nsfw) (deny <channel>)",
        category: "settings",
        description: "Configures the CorkBoard feature for this server. Requires **Manage Server** permission."
    },
    run: async (bot, message, args) => {

        if (!message.member.hasPermission("MANAGE_GUILD") || !message.member.hasPermission("ADMINISTRATOR")) {
          return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
        }

        let serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
        let serverDenyList = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/denylist.json`, 'utf8'));
        const embed = new discord.MessageEmbed()
            .setColor(orange)
            .setTitle(`${bot.user.username} CorkBoard Settings`);

        // If the corkboard channel gets deleted before this command runs, reset it so it displays as "none set!".
        if (!serverConfig.corkboard.channelID) {
          serverConfig.corkboard.channelID = null;
          fs.writeFileSync(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), "utf8");
        }

        if (args[0] && isNaN(args[0])) { args[0] = args[0].toLowerCase(); }
        switch (args[0]) {
          case 'on':
            if (serverConfig.corkboard.enabled) {
              embed.setDescription(`**CorkBoard already enabled.**`);
              embed.addField(`CorkBoard already enabled for this server.`, `If you would like to turn it off, do \`${serverConfig.prefix}corkboard off\`.`);
              return message.channel.send({embed});
            }
            serverConfig.corkboard.enabled = true;
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to turn on the CorkBoard feature! Please try again later.");
              }
            });

            embed.setDescription(`**CorkBoard enabled.**`);
            if (!serverConfig.corkboard.channelID && !serverConfig.corkboard.channelID.deleted) {
              embed.addField(`The CorkBoard feature is now enabled.`, `A corkboard channel has already been set, so you're ready to go!`);
            }
            else {
              embed.addField(`The CorkBoard feature is now enabled.`, `A corkboard channel has not been set yet, so please set one with \`${serverConfig.prefix}corkboard channel <channel mention>\`.`);
            }
            return message.channel.send({embed});

          case 'off':
            if (!serverConfig.corkboard.enabled) {
              embed.setDescription(`**CorkBoard already disabled.**`);
              embed.addField(`The CorkBoard feature is already disabled for this server.`, `If you would like to turn it on, do \`${serverConfig.prefix}corkboard on\`.`);
              return message.channel.send({embed});
            }
            serverConfig.corkboard.enabled = false;
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to turn off the CorkBoard feature! Please try again later.");
              }
            });

            embed.setDescription(`**CorkBoard disabled.**`);
            embed.addField(`The CorkBoard feature is disabled for this server.`, `If you would like to turn it on again, do \`${serverConfig.prefix}corkboard on\`.`);
            return message.channel.send({embed});

          case 'channel':
            // Show the general help message for the channel argument.
            if (!args.slice(1) || args.slice(1).length < 1) {
              embed.setDescription(`Sets the channel for pinned messages to appear.`);
              switch (serverConfig.corkboard.channelID) {
                case null:
                  embed.addField("Current CorkBoard Channel:", `**None set!**`);
                  break;
                default:
                  embed.addField("Current CorkBoard Channel:", `<#${serverConfig.corkboard.channelID}>`);
              }
              embed.addField("To update:", `\`${serverConfig.prefix}corkboard channel <channel mention>\``);
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
              serverConfig.corkboard.channelID = channelID;

              // If the CorkBoard is off, automatically turn it on.
              if (!serverConfig.corkboard.enabled) serverConfig.corkboard.enabled = true;

              // Save the new settings to the server's config.json file.
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to set the CorkBoard channel! Please try again later.");
                }
              });

              embed.setDescription(`CorkBoard channel set.`);
              embed.addField(`The CorkBoard channel has now been set to: `, `<#${serverConfig.corkboard.channelID}>`);
              return message.channel.send({embed});
            }
            else {
              embed.setDescription(`Channel mention required.`);
              embed.addField(`Please enter a channel mention to set it as the CorkBoard channel!`, `Please try again.`, true);
              return message.channel.send({embed});
            }

          case 'instapin':
            // check if pin mode is already set to InstaPin
            if (serverConfig.corkboard.pinMode == "instapin") {
              embed.setDescription(`**InstaPin Mode already set.**`);
              embed.addField(`InstaPin Mode is already enabled for this server.`, `If you would like to switch to Democratic Mode, do \`${serverConfig.prefix}corkboard democratic\`.`);
              return message.channel.send({embed});
            }
            serverConfig.corkboard.pinMode = "instapin";  // <-- set pin mode to InstaPin (switch it from Democratic)
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to set the pin mode! Please try again later.");
              }
            });

            embed.setDescription(`**InstaPin Mode enabled.**`);
            if (!serverConfig.corkboard.channelID && !serverConfig.corkboard.channelID.deleted) {
              embed.addField(`InstaPin Mode is now enabled.`, `A corkboard channel has already been set, so you're ready to go!`);
            }
            else {
              embed.addField(`InstaPin Mode is now enabled.`, `A corkboard channel has not been set yet, so please set one with \`${serverConfig.prefix}corkboard channel <channel mention>\`.`);
            }
            return message.channel.send({embed});

          case 'democratic':
            // check if pin mode is already set to Democratic
            if (serverConfig.corkboard.pinMode == "democratic") {
              embed.setDescription(`**Democratic Pin Mode already set.**`);
              embed.addField(`Democratic Pin Mode is already enabled for this server.`, `If you would like to switch to InstaPin Mode, do \`${serverConfig.prefix}corkboard instapin\`.`);
              return message.channel.send({embed});
            }
            serverConfig.corkboard.pinMode = "democratic";  // <-- set pin mode to Democratic (switch it from InstaPin)
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to set the pin mode! Please try again later.");
              }
            });

            embed.setDescription(`**Democratic Pin Mode enabled.**`);
            if (!serverConfig.corkboard.channelID && !serverConfig.corkboard.channelID.deleted) {
              embed.addField(`Democratic Pin Mode is now enabled.`, `A corkboard channel has already been set, so you're ready to go!`);
            }
            else {
              embed.addField(`Democratic Pin Mode is now enabled.`, `A corkboard channel has not been set yet, so please set one with \`${serverConfig.prefix}corkboard channel <channel mention>\`.`);
            }
            return message.channel.send({embed});

          case 'pins':
            if (!args.slice(1) || args.slice(1).length < 1) {
              let description = "Sets the minimum number of :pushpin: reactions needed for a post to appear in the CorkBoard channel.";
              embed.addField("Pin Threshold:", serverConfig.corkboard.pinThreshold, true)
              .addField("To update:", `\`${serverConfig.prefix}corkboard pins <number>\``, true);
              if (serverConfig.corkboard.pinMode == "instapin") {
                embed.setDescription(`${description}\n(**Available in Democratic Pin Mode only.** Currently set to \`InstaPin\`.)`);
              }
              else { embed.setDescription(description); }
              return message.channel.send({embed});
            }
            // check if pin mode is set to InstaPin (false)
            if (serverConfig.corkboard.pinMode == "instapin") {
              embed.setDescription(`**InstaPin Mode set for this server.**`);
              embed.addField(`You cannot set a pin threshold while in InstaPin Mode.`, `If you would like to switch to Democratic Mode, do \`${serverConfig.prefix}corkboard democratic\`.`);
              return message.channel.send({embed});
            }
            else if (isNaN(args.slice(1).join(""))) {
              embed.setDescription(`Non-number value entered.`)
              .addField("In order to set the number of pins, please enter a number!", `Do \`${serverConfig.prefix}corkboard pins <number>\` to set the pin threshold.`);
              return message.channel.send({embed});
            }
            serverConfig.corkboard.pinThreshold = Math.trunc(args.slice(1).join(""));
            if (serverConfig.corkboard.pinThreshold < 1) {
              embed.setDescription(`Value too low.`)
              .addField("The minimum pin threshold must be 1 or higher.", `Do \`${serverConfig.prefix}corkboard pins <number>\` to set the pin threshold.`);
              return message.channel.send({embed});
            }
            fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
              if (err) {
                console.log(err);
                return message.channel.send("Something went wrong while trying to set the pin threshold! Please try again later.");
              }
            });

            embed.setDescription(`Pin Threshold set.`);
            embed.addField(`The minimum pin threshold has now been set to: `, `${serverConfig.corkboard.pinThreshold} pin(s)`);
            return message.channel.send({embed});

          case 'nsfw':
            // check if corkboard allows NSFW channels
            if (!serverConfig.corkboard.allowNSFW) {
              serverConfig.corkboard.allowNSFW = true;
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to allow NSFW pins! Please try again later.");
                }
              });
              embed.setDescription(`**NSFW channels allowed to pin messages.**`);
              embed.addField("NSFW channels are now allowed to pin messages to the CorkBoard.", `If you would like to disable them, do \`${serverConfig.prefix}corkboard nsfw\` again.`);
              return message.channel.send({embed});
            }
            else {
              serverConfig.corkboard.allowNSFW = false;
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to deny NSFW pins! Please try again later.");
                }
              });
              embed.setDescription(`**NSFW channels no longer allowed to pin messages.**`);
              embed.addField("NSFW channels are no longer allowed to pin messages to the CorkBoard.", `If you would like to enable them, do \`${serverConfig.prefix}corkboard nsfw\` again.`);
              return message.channel.send({embed});
            }

          case 'deny':
            if (!args.slice(1) || args.slice(1).length < 1) {
              embed.setDescription("Denies certain channels from pinning posts to the CorkBoard channel.");
              if (serverDenyList.corkboard.length < 1) {
                embed.addField("Current Deny-list:", "**No restricted channels set!**", false);
              } else {
                var str = '';
                for (var bc = 0; bc < serverDenyList.corkboard.length - 1; bc++) {
                  str += `<#${serverDenyList.corkboard[bc]}> | `;
                }
                str += `<#${serverDenyList.corkboard[serverDenyList.corkboard.length - 1]}>`;
                embed.addField(`Current Deny-list (${serverDenyList.corkboard.length} channels):`, str, false);
              }
              embed.addField("To update:", `\`${serverConfig.prefix}corkboard deny <channel mention>\``, false);
              return message.channel.send({embed});
            }

            if (args[1].startsWith('<@') && args[1].endsWith('>')) {
              embed.setDescription(`Cannot add a user.`);
              embed.addField(`You cannot add a user mention to deny from the CorkBoard channel!`, `Please try again.`, true);
              return message.channel.send({embed});
            }
            else if (args[1].startsWith('<#') && args[1].endsWith('>')) {
              var channelID = args[1].slice(2, args[1].length - 1);  // removes the preceding "<#" and ending ">"
              if (!message.guild.channels.cache.get(channelID)) {
                embed.setDescription(`Cannot add a non-existent channel.`);
                embed.addField(`You cannot add a non-existent channel to the CorkBoard channel deny-list!`, `Please try again.`, true);
                return message.channel.send({embed});
              }
              else if (message.guild.channels.cache.get(channelID).type !== 'text') {
                embed.setDescription(`Cannot add non-text channels.`);
                embed.addField(`You cannot add a non-text channel to the CorkBoard channel deny-list!`, `Please try again.`, true);
                return message.channel.send({embed});
              }

              if (serverDenyList.wordfilter.length >= serverConfig.corkboard.maxBlackListSize) {
                embed.setDescription(`**CorkBoard deny-list maximum size reached!**`)
                .addField(`The CorkBoard deny-list can only hold up to ${serverConfig.corkboard.maxBlackListSize} channels.`, `Remove some with \`${serverConfig.prefix}corkboard deny <channel mention>\`.`);
                return message.channel.send({embed});
              }

              // If the channel exists in the deny-list, remove it. If it doesn't, add it.
              if (serverDenyList.corkboard.includes(channelID)) {
                for (let rc = 0; rc < serverDenyList.corkboard.length; rc++) {
                  if (channelID == serverDenyList.corkboard[rc]) {
                    serverDenyList.corkboard.splice(rc, 1);
                  }
                }
              }
              else { serverDenyList.corkboard.push(channelID); }

              // Save the new settings to the server's deny-list.json file.
              fs.writeFile(`./config/server/${message.guild.id}/denylist.json`, JSON.stringify(serverDenyList), (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Something went wrong while trying to update the CorkBoard deny-list! Please try again later.");
                }
                else {
                  var str = '';
                  for (var bc = 0; bc < serverDenyList.corkboard.length - 1; bc++) {
                    str += `<#${serverDenyList.corkboard[bc]}> | `;
                  }
                  if (serverDenyList.corkboard.length < 1) { str = "**No restricted channels set!**"; }
                  else if (serverDenyList.corkboard.length == 1) { str = `<#${serverDenyList.corkboard[0]}>`; }
                  else { str += `<#${serverDenyList.corkboard[serverDenyList.corkboard.length - 1]}>`; }
                  embed.setDescription(`CorkBoard deny-list updated.`);
                  embed.addField(`The CorkBoard deny-list has now been set to: `, str);
                  return message.channel.send({embed});
                }
              });
            }
            else {
              embed.setDescription(`Channel mention required.`);
              embed.addField(`Please enter a channel mention to deny it from the CorkBoard!`, `Please try again.`, true);
              return message.channel.send({embed});
            }
            break;

          default:
            // show general corkboard settings
            embed.setDescription(`Turns the CorkBoard feature on or off, changes the channel to show pinned messages, and changes the minimum number of pins for a post to show in the pin channel.`);
            embed.addField("Change options with:", `on - turns on CorkBoard\noff - turns off CorkBoard\nchannel - sets the CorkBoard channel\ndemocratic - toggles Democratic Mode (react with 📌 to pin posts)\ninstapin - toggles InstaPin Mode (pin a message with "pin message")\npins - sets the number of pin reactions needed for a post to show in the corkboard channel\nnsfw - allow/deny pins from NSFW channels\ndeny - deny pins from certain channels`);
            switch (serverConfig.corkboard.enabled) {
              case false:
                embed.addField("CorkBoard:",  "**disabled**", true);
                break;
              case true:
                embed.addField("CorkBoard:",  "**enabled**", true);
                break;
            }
            switch (serverConfig.corkboard.channelID) {
              case null:
                embed.addField(`CorkBoard Channel: `, `**None set!**`, true);
                break;
              default:
                embed.addField(`CorkBoard Channel: `, `<#${serverConfig.corkboard.channelID}>`, true);
                break;
            }
            switch(serverConfig.corkboard.allowNSFW) {
              case true:
                embed.addField(`Allow NSFW Pins:`, "**yes**", true);
                break;
              case false:
                embed.addField(`Allow NSFW Pins:`, "**no**", true);
                break;
            }
            switch (serverConfig.corkboard.pinMode) {
              case "democratic":
                embed.addField("Pin Mode: ", "`Democratic`", true)
                .addField("Pin Reaction Threshold:", serverConfig.corkboard.pinThreshold, true);
                break;
              case "instapin":
                embed.addField("Pin Mode: ", "`InstaPin`", true);
                break;
            }
            var str = '';
            for (var bc = 0; bc < serverDenyList.corkboard.length - 1; bc++) {
              str += `<#${serverDenyList.corkboard[bc]}> | `;
            }
            str += `<#${serverDenyList.corkboard[serverDenyList.corkboard.length - 1]}>`;
            if (serverDenyList.corkboard.length < 1) {
              embed.addField("Current Deny-list:", "**No restricted channels set!**", false);
            }
            else {
              embed.addField(`Current Deny-list (${serverDenyList.corkboard.length} channels):`, str, false);
            }
            return message.channel.send({embed});
        }
    }
}
