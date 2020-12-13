/* This command removes songs from the server's queue. If there is a queue, the bot checks
if there's a song exists at the position given (provided it's a number). */

module.exports = {
    config: {
        name: "remove",
        aliases: ["rem"],
        usage: "<song position>",
        category: "music",
        description: "Removes a song from the queue."
    },
    run: async (bot, message, args) => {

      const serverQueue = bot.queue.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }

      const pos = args.join("");
      if (!pos || isNaN(pos)) {
        return message.channel.send(`**${message.author.username}**, please enter a song's position as a number!`);
      }

      const cleanInt = Math.trunc(pos);
      if (serverQueue.songs.length < 1) {
        return message.channel.send(`**${message.author.username}**, there are no songs in the queue!`);
      }
      else if (cleanInt > serverQueue.songs.length || cleanInt < 0) {
        return message.channel.send(`**${message.author.username}**, there's no song at that position!`);
      }
      else if (cleanInt == 0) {
        return message.channel.send(`**${message.author.username}**, you can use the \`skip\` command to remove the currently playing song from queue!`);
      }

      const deletedSongTitle = serverQueue.songs[cleanInt].title;
      serverQueue.songs.splice(cleanInt, 1);
      bot.queue.set(message.guild.id, serverQueue);
      return message.channel.send(`The song **${deletedSongTitle}** has been deleted!`);

    }
}
