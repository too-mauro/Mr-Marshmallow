/* This command skips the currently playing song and plays the next one, if one is playing. */

const { playSong } = require("../../config/bot/util.js");

module.exports = {
    config: {
        name: "skip",
        aliases: ["sk"],
        usage: "",
        category: "music",
        description: "Skips the currently playing song."
    },
    run: async (bot, message, args) => {

      // Check if user is in a voice channel, the bot can join it, if it's full, and if the bot and the user are in the same voice channel
      if (!message.member.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
      }
      else if (message.guild.me.voice.channel && (message.member.voice.channel !== message.guild.me.voice.channel)) {
        return message.channel.send(`**${message.author.username}**, you need to be in the same voice channel to use this command!`);
      }

      const serverQueue = bot.queue.get(message.guild.id);
      if (!serverQueue) {
        // there's no queue
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }

      if (serverQueue.queueLoop) {
        /* if loop is on, push the song back at the end of the queue
        so it can repeat endlessly */
        let lastSong = serverQueue.songs.shift();
        serverQueue.songs.push(lastSong);
        message.channel.send(":track_next: Skipped!");
        return playSong(bot, serverQueue.songs[0], message);
      }
      else if (serverQueue.songLoop) {
        // don't modify the queue and just repeat the first song
        message.channel.send(":track_next: Skipped!");
        return playSong(bot, serverQueue.songs[0], message);
      }
      // skip to the next song, if one exists
      serverQueue.songs.shift();
      if (serverQueue.songs[0]) {
        message.channel.send(":track_next: Skipped!");
        return playSong(bot, serverQueue.songs[0], message);
      }
      else {
        return message.channel.send(`**${message.author.username}**, there's nothing in the queue after this song!`);
      }
    }
}
