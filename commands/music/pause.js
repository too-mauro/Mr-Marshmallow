/* This command pauses the currently playing song, if one is playing. */

module.exports = {
    config: {
        name: "pause",
        description: "Pauses or resumes a currently playing or paused song.",
        usage: "",
        aliases: ["pa", "stop", "resume"],
        category: "music"
    },
    run: async (bot, message, args) => {

      const serverQueue = bot.musicQueues.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }

      if (serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause(true);
        return message.channel.send(":pause_button:  Paused!");
      }
      else {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        return message.channel.send(":arrow_forward:  Resumed!");
      }
    }
}
