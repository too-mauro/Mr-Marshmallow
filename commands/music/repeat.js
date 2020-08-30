/* This command toggles the repeat functionality on the server's queue, if one exists. */
const fs = require("fs");

module.exports = {
    config: {
        name: "repeat",
        aliases: ["rep", "loop"],
        usage: "(song) (queue/all)",
        category: "music",
        description: "Toggles the repeat on the current song or queue."
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

        if (args[0]) {
          if (isNaN(args[0])) { args[0] = args[0].toLowerCase(); }
          if (args[0] == "song") {
            if (serverQueue.playlistLoop) { serverQueue.playlistLoop = !serverQueue.playlistLoop; }
            serverQueue.songLoop = !serverQueue.songLoop;
            bot.queue.set(message.guild.id, serverQueue);
            return message.channel.send(`:repeat:  Song repeat is now ${serverQueue.songLoop ? "**on**" : "**off**"}.`);
          }
          else if (args[0] == "queue" || args[0] == "all") {
            if (serverQueue.songLoop) { serverQueue.songLoop = !serverQueue.songLoop; }
            serverQueue.queueLoop = !serverQueue.queueLoop;
            bot.queue.set(message.guild.id, serverQueue);
            return message.channel.send(`:repeat:  Playlist repeat is now ${serverQueue.queueLoop ? "**on**" : "**off**"}.`);
          }
        }
        else {
          const prefix = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8")).prefix;
          return message.channel.send(`**__${message.guild.name} Loop Status__**\nSong Loop: ${serverQueue.songLoop ? "**on**" : "**off**"}   ||   Queue Loop: ${serverQueue.queueLoop ? "**on**" : "**off**"}\n(Do \`${prefix}loop <song>\` to toggle song loop or \`${prefix}loop <queue/all>\` to toggle queue loop.)`);
        }
      }
      else {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }

    }
}
