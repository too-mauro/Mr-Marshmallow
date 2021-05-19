/* This commands allows Mr. Marshmallow to join a voice channel if it has the permission
to do so. It needs the "Connect" and "Speak" permissions, as well as the permission to
join the specific channel the user is in, to join. */

module.exports = {
    config: {
        name: "join",
        description: "Joins the user if they're in a voice channel.",
        usage: "",
        aliases: ["jo"],
        category: "music"
    },
    run: async (bot, message, args) => {

        // Check if bot can join voice channels
        if (!message.guild.me.hasPermission("CONNECT") || !message.guild.me.hasPermission("SPEAK")) {
          return message.channel.send(`**${message.author.username}**, I need the \`Connect\` and \`Speak\` permissions to join a voice channel!`);
        }

        // Check if user is in a voice channel, the bot can join it, and if it's full
        if (!message.member.voice.channel) {
          return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
        }
        else if (!message.member.voice.channel.joinable) {
          return message.channel.send(`**${message.author.username}**, I can't join \`${message.member.voice.channel.name}\`! Do I not have permission to join it...?`);
        }
        else if (message.member.voice.channel.full && !message.guild.me.permissionsIn(message.member.voice.channel).has("MOVE_MEMBERS")) {
          return message.channel.send(`**${message.author.username}**, I can't join \`${message.member.voice.channel.name}\` because it's full! Please either make some room for me or give me the \`Move Members\` permission.`);
        }

        // Check if the bot's with the user already
        if (message.member.voice.channel == message.guild.me.voice.channel) {
          return message.channel.send(`**${message.author.username}**, I'm already in \`${message.member.voice.channel.name}\` with you!`);
        }
        const serverQueue = bot.musicQueues.get(message.guild.id);
        try {
          if (serverQueue) {
            serverQueue.voiceChannel = message.member.voice.channel;
            serverQueue.connection = await message.member.voice.channel.join();
            bot.musicQueues.set(message.guild.id, serverQueue);
            return message.channel.send(`Switched to \`${message.member.voice.channel.name}\`!`);
          }
          else {
            let connection = await message.member.voice.channel.join();
            return message.channel.send(`Joined \`${message.member.voice.channel.name}\`!`);
          }
        }
        catch (err) {
          console.error(err);
          return message.channel.send("Something went wrong while trying to join the voice channel! ", err.message);
        }
    }
}
