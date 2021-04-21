/* This command lets the bot disconnect from a voice channel. Be warned: if
there is a playlist currently set, the bot will automatically clear it. */

module.exports = {
    config: {
        name: "disconnect",
        description: "Leaves the voice channel.",
        usage: "",
        aliases: ["dc", "leave"],
        category: "music"
    },
    run: async (bot, message, args) => {

      // Check if bot can leave voice channels
      if (!message.guild.me.hasPermission("CONNECT") || !message.guild.me.hasPermission("SPEAK")) {
        return message.channel.send(`**${message.author.username}**, I need both the \`Connect\` and \`Speak\` permissions to leave a voice channel!`);
      }

      // Check if user is in a voice channel, the bot can join it, and if it's full
      if (!message.member.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
      }

      // Only try to leave the voice channel if the bot is in one and delete the queue if one exists
      // Don't forget to check if the user and the bot are in the same voice channel
      if (!message.guild.me.voice.channel) {
        return message.channel.send(`**${message.author.username}**, I'm not in a voice channel. Use the \`join\` command to get me in one!`);
      }
      else if (message.member.voice.channel !== message.guild.me.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in \`${message.guild.me.voice.channel}\` with me to use this command!`);
      }

      const serverQueue = bot.musicQueues.get(message.guild.id);
      if (serverQueue) {
        if (serverQueue.textChannel !== message.channel) {
          return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
        }
        try {
          serverQueue.connection.dispatcher.destroy();
          serverQueue.voiceChannel.leave();
          bot.musicQueues.delete(message.guild.id);
          return message.channel.send(`Successfully disconnected from \`${serverQueue.voiceChannel.name}\`!`);
        }
        catch (err) {
          console.error(err);
          message.guild.me.voice.channel.leave(); // serverQueue may or may not be defined
          bot.musicQueues.delete(message.guild.id);
          return message.channel.send(`Sorry **${message.author.username}**, something went wrong while trying to disconnect!`);
        }
      }
      else {
        message.guild.me.voice.channel.leave();
        return message.channel.send(`Successfully disconnected from \`${message.guild.me.voice.channel.name}\`!`);
      }
    }
}
