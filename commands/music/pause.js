/* This command pauses the currently playing song, if one is playing. */

module.exports = {
    config: {
        name: "pause",
        aliases: ["stop"],
        usage: "",
        category: "music",
        description: "Pauses a currently playing song."
    },
    run: async (bot, message, args) => {

      const serverQueue = bot.queue.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }

      if (serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause(true);
        return message.channel.send(":pause_button:  Paused!");
      }
      else {
        return message.channel.send(`**${message.author.username}**, the music's already paused!`);
      }
    }
}
