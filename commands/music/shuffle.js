/* This command shuffles the server's queue, if one exists. */

module.exports = {
    config: {
        name: "shuffle",
        aliases: ["sh"],
        usage: "",
        category: "music",
        description: "Shuffle the queue."
    },
    run: async (bot, message, args) => {

      // Check if user is in a voice channel, the bot can join it, if it's full, and if the bot and the user are in the same voice channel
      if (!message.member.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
      }
      else if (message.member.voice.channel !== message.guild.me.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in the same voice channel to use this command!`);
      }

      const serverQueue = bot.queue.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }

      let songs = serverQueue.songs;
      if (songs.length - 1 > 0) {   // <-- the -1 is to account for the currently playing song
        for (let i = songs.length - 1; i > 1; i--) {
          let j = 1 + Math.floor(Math.random() * i);
          [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        serverQueue.songs = songs;
        bot.queue.set(message.guild.id, serverQueue);
        return message.channel.send(":twisted_rightwards_arrows:  Shuffled!");
      }
      return message.channel.send(`**${message.author.username}**, there are no songs to shuffle!`);
    }
}
