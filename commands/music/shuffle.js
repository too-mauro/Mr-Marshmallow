/* This command shuffles the server's queue, if one exists. */

module.exports = {
    config: {
        name: "shuffle",
        description: "Shuffle the queue.",
        usage: "",
        aliases: ["sh"],
        category: "music"
    },
    run: async (bot, message, args) => {

      // Check if user is in a voice channel, the bot can join it, if it's full, and if the bot and the user are in the same voice channel
      if (!message.member.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
      }
      else if (message.member.voice.channel !== message.guild.me.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in the same voice channel to use this command!`);
      }

      const serverQueue = bot.musicQueues.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }
      else if (serverQueue.songs.length - 1 < 1) {   // <-- the -1 is to account for the currently playing song
        return message.channel.send(`**${message.author.username}**, there are no songs to shuffle!`);
      }
      else {
        let songs = serverQueue.songs;
        songs.forEach((song, i) => {
          if (i < 1) return; // don't shuffle currently playing song
          let j = 1 + Math.floor(Math.random() * i);
          [song, songs[j]] = [songs[j], song];
        });
        serverQueue.songs = songs;
        return message.channel.send(":twisted_rightwards_arrows:  Shuffled!");
      }
    }
}
