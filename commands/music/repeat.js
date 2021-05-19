/* This command toggles the repeat functionality on the server's queue, if one exists. */
const {readFileSync} = require("fs");

module.exports = {
    config: {
        name: "repeat",
        description: "Toggles the repeat on the current song or queue.",
        usage: "(queue/all)",
        aliases: ["rep", "loop"],
        category: "music"
    },
    run: async (bot, message, args) => {

      // Check if user is in a voice channel and if they're in the same channel as the bot
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

      if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }

      if (args[0]) args[0] = args[0].toLowerCase();
      if (args[0] == "queue" || args[0] == "all") {
        if (serverQueue.loop.song) serverQueue.loop.song = !serverQueue.loop.song;
        serverQueue.loop.queue = !serverQueue.loop.queue;
        return message.channel.send(`:repeat:  Playlist repeat is now ${serverQueue.loop.queue ? "**on**" : "**off**"}.`);
      }
      else {
        const prefix = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8")).prefix;
        if (serverQueue.loop.queue) {
          serverQueue.loop.queue = !serverQueue.loop.queue;
          return message.channel.send(`:repeat:  Playlist repeat is now ${serverQueue.loop.queue ? "**on**" : "**off**"}.\n(Do \`${prefix}repeat\` again to toggle song loop.)`);
        }
        else {
          serverQueue.loop.song = !serverQueue.loop.song;
          bot.musicQueues.set(message.guild.id, serverQueue);
          return message.channel.send(`:repeat:  Song repeat is now ${serverQueue.loop.song ? "**on**" : "**off**"}.\n(Do \`${prefix}repeat <queue/all>\` to toggle queue loop.)`);
        }
      }

    }
}
