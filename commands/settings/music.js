/*
This command changes the prefix for the server. It checks to see if the person
running the command has either the "Manage Server" or "Administrator" permissions
and prevents anyone who doesn't have either from running it.
*/

const {readFileSync, writeFile} = require("fs");
const {MessageEmbed} = require("discord.js");
const {orange} = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "music",
        description: "Changes settings for the music commands. Requires **Manage Server** permission.",
        usage: "(message) (embed) (topic <on/off>) (vote <on/off>)",
        aliases: ["m"],
        category: "settings"
    },
    run: async (bot, message, args) => {

        if (!message.member.hasPermission("MANAGE_SERVER") || !message.member.hasPermission("ADMINISTRATOR")) {
          return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
        }

        const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
        const embed = new MessageEmbed()
            .setColor(orange)
            .setTitle(`${bot.user.username} Music Settings`);

        if (args[0] && isNaN(args[0])) args[0] = args[0].toLowerCase();
        switch (args[0]) {
          case "message":
            // show or don't show the "now playing" message
            switch (args[1]) {
              case "on":
                // turn on message
                if (serverConfig.music.nowPlayingEnabled) {
                  embed.setDescription(`**"Now Playing" message already enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}music message off\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.nowPlayingEnabled = true;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to turn on the \"now playing\" message! Please try again later.");
                  }
                });

                embed.setDescription(`**"Now Playing" message enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}music message off\`.`);
                return message.channel.send({embed});
                break;

              case "off":
                // turn off message
                if (!serverConfig.music.nowPlayingEnabled) {
                  embed.setDescription(`**"Now Playing" message already disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}music message on\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.nowPlayingEnabled = false;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to turn off the \"now playing\" message! Please try again later.");
                  }
                });

                embed.setDescription(`**"Now Playing" message disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}music message on\`.`);
                return message.channel.send({embed});
                break;

              default:
                embed.setDescription("Changes the setting to send a message when a new song plays.")
                .addField("Now Playing Message:", serverConfig.music.nowPlayingEnabled ? "**enabled**" : "**disabled**")
                .addField("To update:", `\`${serverConfig.prefix}music message <on/off>\``);
                return message.channel.send({embed});
            }
            break;

          case "embed":
            // use or don't use message embeds with songs
            switch (args[1]) {
              case "on":
                // turn on message
                if (serverConfig.music.embedEnabled) {
                  embed.setDescription(`**Embed messages already enabled.**\nIf you would like to turn them off, do \`${serverConfig.prefix}music message off\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.embedEnabled = true;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to turn on the embedded message setting! Please try again later.");
                  }
                });

                embed.setDescription(`**Embed messages enabled.**\nIf you would like to turn them off, do \`${serverConfig.prefix}music embed off\`.`);
                return message.channel.send({embed});
                break;

              case "off":
                // turn off message
                if (!serverConfig.music.embedEnabled) {
                  embed.setDescription(`**Embed messages already disabled.**\nIf you would like to turn them on, do \`${serverConfig.prefix}music embed on\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.embedEnabled = false;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to turn off the embedded message setting! Please try again later.");
                  }
                });

                embed.setDescription(`**Embed messages disabled.**\nIf you would like to turn them on, do \`${serverConfig.prefix}music embed on\`.`);
                return message.channel.send({embed});
                break;

              default:
                embed.setDescription("Changes the setting to send an embedded message when a new song plays.")
                .addField("Send Embed Messages:", serverConfig.music.embedEnabled ? "**enabled**" : "**disabled**")
                .addField("To update:", `\`${serverConfig.prefix}music embed <on/off>\``);
                return message.channel.send({embed});
            }
            break;

          case "topic":
            // change or don't change topic when playing songs
            switch (args[1]) {
              case "on":
                // turn on message
                if (serverConfig.music.channelTopicChangeEnabled) {
                  embed.setDescription(`**Channel topic change already enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}music topic off\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.channelTopicChangeEnabled = true;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to turn on the change topic setting! Please try again later.");
                  }
                });

                embed.setDescription(`**Channel topic change enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}music topic off\`.`);
                return message.channel.send({embed});
                break;

              case "off":
                // turn off message
                if (!serverConfig.music.channelTopicChangeEnabled) {
                  embed.setDescription(`**Channel topic change already disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}music topic on\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.channelTopicChangeEnabled = false;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to turn off the change topic setting! Please try again later.");
                  }
                });

                embed.setDescription(`**Channel topic change disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}music topic on\`.`);
                return message.channel.send({embed});
                break;

              default:
                embed.setDescription("Changes the setting to change the text channel's topic when a new song plays.")
                .addField("Change Channel Topic:", serverConfig.music.channelTopicChangeEnabled ? "**enabled**" : "**disabled**")
                .addField("To update:", `\`${serverConfig.prefix}music topic <on/off>\``);
                return message.channel.send({embed});
            }
            break;

          case "vote":
            // enable or disable voting to skip songs
            switch (args[1]) {
              case "on":
                // turn on message
                if (serverConfig.music.voteSkipEnabled) {
                  embed.setDescription(`**Song skip voting already enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}music vote off\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.voteSkipEnabled = true;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to turn on the song skip voting setting! Please try again later.");
                  }
                });

                embed.setDescription(`**Song skip voting enabled.**\nIf you would like to turn it off, do \`${serverConfig.prefix}music vote off\`.`);
                return message.channel.send({embed});
                break;

              case "off":
                // turn off message
                if (!serverConfig.music.voteSkipEnabled) {
                  embed.setDescription(`**Song skip voting already disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}music vote on\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.voteSkipEnabled = false;
                writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.error(err);
                    return message.channel.send("Something went wrong while trying to turn off the song skip voting setting! Please try again later.");
                  }
                });

                embed.setDescription(`**Song skip voting disabled.**\nIf you would like to turn it on, do \`${serverConfig.prefix}music vote on\`.`);
                return message.channel.send({embed});
                break;

              default:
                embed.setDescription("Changes the setting to toggle voting to skip songs.")
                .addField("Vote to Skip Songs:", serverConfig.music.voteSkipEnabled ? "**enabled**" : "**disabled**")
                .addField("To update:", `\`${serverConfig.prefix}music vote <on/off>\``);
                return message.channel.send({embed});
            }
            break;

          default:
            embed.setDescription("Changes settings to show a \"Now Playing\" message, show embeds or plain text messages, allow the bot to change the channel's topic, and toggle skip song voting.")
            .addField("Change options with:", `message - change whether a "Now Playing" appears when a new song plays\nembed - change whether to display an embed or text for music\ntopic - change whether the channel's topic changes when a new song plays\nvote - change whether to allow voting for skipping songs`)
            .addField("Now Playing Message", serverConfig.music.nowPlayingEnabled ? "**enabled**" : "**disabled**", true)
            .addField("Send Embed Messages", serverConfig.music.embedEnabled ? "**enabled**" : "**disabled**", true)
            .addField("Change Channel Topic", serverConfig.music.channelTopicChangeEnabled ? "**enabled**" : "**disabled**", true)
            .addField("Vote to Skip Songs", serverConfig.music.voteSkipEnabled ? "**enabled**" : "**disabled**", true);
            return message.channel.send({embed});
        }

   }
}
