/* This command clears the playlist so only the currently playing song is left in the queue, if
one exists. */

module.exports = {
    config: {
        name: "clear",
        aliases: ["c"],
        usage: "",
        category: "music",
        description: "Clears the queue."
    },
    run: async (bot, message, args) => {

      // Check if user is in a voice channel and if they're in the same channel as the bot
      if (!message.member.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
      }
      else if (message.member.voice.channel !== message.guild.me.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in the same voice channel to use this command!`);
      }

      const serverQueue = bot.queue.get(message.guild.id);
      if (serverQueue) {
        if (serverQueue.textChannel !== message.channel) {
          return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
        }
        serverQueue.songs.length = 1;
        bot.queue.set(message.guild.id, serverQueue);
        return message.channel.send(":stop_button:  Queue has been cleared!");
      }
      else {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
    }
}
