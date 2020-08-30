/*
This command changes the prefix for the server. It checks to see if the person
running the command has either the "Manage Server" or "Administrator" permissions
and prevents anyone who doesn't have either from running it.
*/

const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const { orange } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "music",
        aliases: ["m"],
        usage: "(message) (embed) (topic <on/off>)",
        category: "settings",
        description: "Changes settings for the music commands. Requires **Manage Server** permission."
    },
    run: async (bot, message, args) => {

        if (!message.member.hasPermission("MANAGE_SERVER") || !message.member.hasPermission("ADMINISTRATOR")) {
          return message.channel.send(`**${message.author.username}**, you need to have the \`Manage Server\` or \`Administrator\` permissions to use this command!`);
        }


        const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
        const embed = new MessageEmbed()
            .setColor(orange)
            .setTitle(`${bot.user.username} Music Settings`);

        if (args[0] && isNaN(args[0])) { args[0] = args[0].toLowerCase(); }
        switch (args[0]) {
          case 'message':
            // show or don't show the "now playing" message
            switch (args[1]) {
              case 'on':
                // turn on message
                if (serverConfig.music.nowPlayingEnabled) {
                  embed.addField(`The "now playing" message is already enabled for this server.`, `If you would like to turn it off, do \`${serverConfig.prefix}music message off\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.nowPlayingEnabled = true;
                fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send('Something went wrong while trying to turn on the "now playing" message! Please try again later.');
                  }
                });

                embed.addField(`The "now playing" message is now enabled for this server.`, `If you would like to turn it off, do \`${serverConfig.prefix}music message off\`.`);
                return message.channel.send({embed});
                break;

              case 'off':
                // turn off message
                if (!serverConfig.music.nowPlayingEnabled) {
                  embed.addField(`The "now playing" message is already disabled for this server.`, `If you would like to turn it on, do \`${serverConfig.prefix}music message on\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.nowPlayingEnabled = false;
                fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send('Something went wrong while trying to turn off the "now playing" message! Please try again later.');
                  }
                });

                embed.addField(`The "now playing" message is now disabled for this server.`, `If you would like to turn it on, do \`${serverConfig.prefix}music message on\`.`);
                return message.channel.send({embed});
                break;

              default:
                embed.setDescription(`Changes the setting to send a message when a new song plays.`)
                .addField("Now Playing Message:", serverConfig.music.nowPlayingEnabled ? "**enabled**" : "**disabled**")
                .addField("To update:", `\`${serverConfig.prefix}music message <on/off>\``);
                return message.channel.send({embed});
            }
            break;

          case 'embed':
            // use or don't use message embeds with songs
            switch (args[1]) {
              case 'on':
                // turn on message
                if (serverConfig.music.embedEnabled) {
                  embed.addField(`Embedded messages are set to send when playing new songs.`, `If you would like to turn it off, do \`${serverConfig.prefix}music message off\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.embedEnabled = true;
                fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send('Something went wrong while trying to turn on the embedded message setting! Please try again later.');
                  }
                });

                embed.addField(`Embedded messages will now send when playing new songs.`, `If you would like to turn it off, do \`${serverConfig.prefix}music embed off\`.`);
                return message.channel.send({embed});
                break;

              case 'off':
                // turn off message
                if (!serverConfig.music.embedEnabled) {
                  embed.addField(`Embedded messages are set not to send when playing new songs.`, `If you would like to turn it on, do \`${serverConfig.prefix}music embed on\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.embedEnabled = false;
                fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send('Something went wrong while trying to turn off the embedded message setting! Please try again later.');
                  }
                });

                embed.addField(`Embedded messages will no longer send when playing new songs.`, `If you would like to turn it on, do \`${serverConfig.prefix}music embed on\`.`);
                return message.channel.send({embed});
                break;

              default:
                embed.setDescription(`Changes the setting to send an embedded message when a new song plays.`)
                .addField("Send Embed Messages:", serverConfig.music.embedEnabled ? "**enabled**" : "**disabled**")
                .addField("To update:", `\`${serverConfig.prefix}music embed <on/off>\``);
                return message.channel.send({embed});
            }
            break;

          case 'topic':
            // change or don't change topic when playing songs
            switch (args[1]) {
              case 'on':
                // turn on message
                if (serverConfig.music.channelTopicChangeEnabled) {
                  embed.addField(`Channel's topic is set to change to song name when playing new songs.`, `If you would like to turn it off, do \`${serverConfig.prefix}music topic off\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.channelTopicChangeEnabled = true;
                fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send('Something went wrong while trying to turn on the change topic setting! Please try again later.');
                  }
                });

                embed.addField(`Channel's topic will now change to song name when playing new songs.`, `If you would like to turn it off, do \`${serverConfig.prefix}music topic off\`.`);
                return message.channel.send({embed});
                break;

              case 'off':
                // turn off message
                if (!serverConfig.music.channelTopicChangeEnabled) {
                  embed.addField(`Channel's topic is set to stay the same when playing new songs.`, `If you would like to turn it on, do \`${serverConfig.prefix}music topic on\`.`);
                  return message.channel.send({embed});
                }
                serverConfig.music.channelTopicChangeEnabled = false;
                fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send('Something went wrong while trying to turn off the change topic setting! Please try again later.');
                  }
                });

                embed.addField(`Channel's topic will no longer change to song name when playing new songs.`, `If you would like to turn it on, do \`${serverConfig.prefix}music topic on\`.`);
                return message.channel.send({embed});
                break;

              default:
                embed.setDescription(`Changes the setting to change the text channel's topic when a new song plays.`)
                .addField("Change Channel Topic:", serverConfig.music.channelTopicChangeEnabled ? "**enabled**" : "**disabled**")
                .addField("To update:", `\`${serverConfig.prefix}music topic <on/off>\``);
                return message.channel.send({embed});
            }
            break;

          default:
            embed.setDescription("Sets settings to show a \"Now Playing\" message, show embeds or plain text messages, and allow the bot to change the channel's topic.")
            .addField("Now Playing Message", serverConfig.music.nowPlayingEnabled ? "**enabled**" : "**disabled**", true)
            .addField("Send Embed Messages", serverConfig.music.embedEnabled ? "**enabled**" : "**disabled**", true)
            .addField("Change Channel Topic", serverConfig.music.channelTopicChangeEnabled ? "**enabled**" : "**disabled**", false);
            return message.channel.send({embed});
        }

   }
}
