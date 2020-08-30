/* This command resumes the currently playing song, if one is playing. */

module.exports = {
    config: {
        name: "resume",
        aliases: ["res"],
        usage: "",
        category: "music",
        description: "Resumes what song was playing before Mr. Marshmallow was paused."
    },
    run: async (bot, message, args) => {

      const serverQueue = bot.queue.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }

      if (!serverQueue.playing) {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        return message.channel.send(":arrow_forward:  Resumed!");
      }
      else {
        return message.channel.send(`**${message.author.username}**, the music's already unpaused!`);
      }
    }
}
