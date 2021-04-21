/* This command removes songs from the server's queue. If there is a queue, the bot checks
if there's a song exists at the position given (provided it's a number). */

module.exports = {
    config: {
        name: "remove",
        description: "Removes one or more songs from the queue.",
        usage: "<song position> (song position)",
        aliases: ["rem"],
        category: "music"
    },
    run: async (bot, message, args) => {

      const serverQueue = bot.musicQueues.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.songs.length < 1) {
        return message.channel.send(`**${message.author.username}**, there are no songs in the queue!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }
      else if (!args || args.length < 1) {
        return message.channel.send(`**${message.author.username}**, please enter a song's position as a number!`);
      }

      let successfulRemoves = [];
      let failedRemoves = [];
      args.forEach(songToRemove => {
        if (isNaN(songToRemove)) {
          failedRemoves.push(songToRemove);
          return message.channel.send(`**${message.author.username}**, please enter the song's number position for ${songToRemove}!`);
        }

        songToRemove = Math.trunc(songToRemove);
        if (songToRemove > serverQueue.songs.length - 1 || songToRemove < 0) { // the -1 accounts for the currently playing song
          failedRemoves.push(songToRemove);
          return message.channel.send(`**${message.author.username}**, there's no song at position ${songToRemove}!`);
        }
        else if (songToRemove == 0) {
          failedRemoves.push(songToRemove);
          return message.channel.send(`**${message.author.username}**, you can use the \`skip\` command to remove the currently playing song from queue!`);
        }
        else {
          const deletedSongTitle = serverQueue.songs[songToRemove].title;
          serverQueue.songs.splice(songToRemove, 1);
          successfulRemoves.push(deletedSongTitle);
        }
      });

      let result;
      if (successfulRemoves.length > 0 && failedRemoves.length < 1) {
        result = `Successfully removed ${successfulRemoves.length} song(s) from the queue:\n**${successfulRemoves.join("\n")}**`;
      }
      else if (successfulRemoves.length > 0 && failedRemoves.length > 0) {
        result = `Successfully removed ${successfulRemoves.length} song(s) from the queue:\n**${successfulRemoves.join("\n")}**\nFailed to remove ${failedRemoves.length} song(s)!`;
      }
      else {
        result = `Failed to remove ${failedRemoves.length} song(s)!`;
      }
      return message.channel.send(result);
    }
}
