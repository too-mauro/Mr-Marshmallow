/* This command shows the currently playing song, if one's playing. */

const {readFileSync} = require("fs");
const {MessageEmbed} = require("discord.js");
const {blue_dark} = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "nowplaying",
        description: "Shows the currently playing song.",
        usage: "",
        aliases: ["np"],
        category: "music"
    },
    run: async (bot, message, args) => {

      // Check if user is in a voice channel
      if (!message.member.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
      }

      const serverQueue = bot.musicQueues.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }
      const song = serverQueue.songs[0];
      const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json` ,"utf8"));
      if (serverConfig.music.embedEnabled) {
        const embed = new MessageEmbed()
          .setColor(blue_dark)
          .setTitle("Now Playing 🎵")
          .setDescription(`[${song.title}](${song.url})`)
          .addField("Song Duration", song.duration, true)
          .addField("Channel", `[${song.channelName}](${song.channelUrl})`, true)
          .addField("Requested by", song.requester, true)
          .addField("Up Next", serverQueue.loop.song ? `${song.title} (loop)` : (serverQueue.songs[1] ? serverQueue.songs[1].title : "Nothing"), false)
          .setThumbnail(song.thumbnail);
        return message.channel.send({embed});
      }
      else {
        return message.channel.send(`**Now Playing 🎵**
        ${song.title}
        **Length:** ${song.duration}
        **Requested by:** ${song.requester}
        **Up Next:** ${serverQueue.loop.song ? `${song.title} (loop)` : (serverQueue.songs[1] ? serverQueue.songs[1].title : "Nothing")}`);
      }

    }
}
