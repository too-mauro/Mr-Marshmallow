/* This file contains many helper functions for many of the different commands
found within Mr. Marshmallow's code. */
const fs = require("fs");
const ytdl = require("ytdl-core");

module.exports = {

  getCategories: () => {
    // Return the list of command categories for the command loader and the `load` command.
    return ["fun", "games", "miscellaneous", "music", "owner", "settings"];
  },

  removeEndingZeroes: (version) => {
    // If the third digit in the version number is 0, remove it from the string. Otherwise, leave it alone.
    if (version.split(".")[2] == 0) return version.slice(0, version.length - 2);
    return version;
  },

  getUserFromMention: (mention, guild) => {
    // The id is the first and only match found by the RegEx.
    const matches = mention.match(/^<@!?(\d+)>$/);
    // If supplied variable was not a mention, matches will be null instead of an array.
    if (!matches) return;
    /* However the first element in the matches array will be the entire mention, not just the ID,
    so use index 1. */
    return guild.members.cache.get(matches[1]);
  },

  permsFor: (guild, user, channel, permissionFlag) => {
    return guild.member(user).permissionsIn(channel).has(permissionFlag);
  },

  extension: (attachment) => {
    /* This is the extension function to check if there's a picture attached to
    the message. This won't work for videos. */
    const imageLink = attachment.split(".");
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
    if (!image) return null;
    return attachment;
  },

  playSong: (bot, song, message) => {
    let serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
    // Play a song
    const queue = bot.queue.get(message.guild.id);
    if (!queue.songs[0]) {
      if (serverConfig.music.nowPlayingEnabled && serverConfig.music.channelTopicChangeEnabled) {
        message.channel.setTopic("Nothing's playing in here right now...").catch(console.error);
      }
      return setTimeout(function () {
        queue.voiceChannel.leave();
        bot.queue.delete(message.guild.id);
      }, 500);
    }

    let stream = null;
    let options = null;
    try {
      if (queue.songs[0].queueDuration > 0) {
        // non-live songs have more than 0 seconds
        options = { filter: 'audio', highWaterMark: 1 << 25, volume: false };
      }
      else { options = { filter: 'audio', highWaterMark: 1 << 25, volume: false, quality: '95' }; }
      stream = ytdl(queue.songs[0].url, options);
    }
    catch (err) {
      if (queue) {
        queue.songs.shift();
        module.exports.playSong(bot, queue.songs[0], message);
      }
      console.error(err);
      return message.channel.send(`I couldn't play a song!\n${err.message ? err.message : err}`);
    }

    try {
      const dispatcher = queue.connection.play(stream)
        .on("finish", () => {
          if (queue.songLoop) {
            module.exports.playSong(bot, queue.songs[0], message);
          }
          else if (queue.queueLoop) {
            let lastSong = queue.songs.shift();
            queue.songs.push(lastSong);
            module.exports.playSong(bot, queue.songs[0], message);
          }
          else {
            // Recursively play the next song
            queue.songs.shift();
            module.exports.playSong(bot, queue.songs[0], message);
          }
        })
        .on("error", (err) => {
          console.error(err);
          message.channel.send(`I couldn't play a song!\n${err.message ? err.message : err}`);
          queue.songs.shift();
          module.exports.playSong(bot, queue.songs[0], message);
        });
      dispatcher.setVolumeLogarithmic(queue.volume / 100);
    }
    catch (err) {
      if (queue) {
        queue.songs.shift();
        module.exports.playSong(bot, queue.songs[0], message);
      }
      console.error(err);
      return message.channel.send(`I couldn't play a song!\n${err.message ? err.message : err}`);
    }

    if (serverConfig.music.nowPlayingEnabled) {
      if (serverConfig.music.embedEnabled) {
        const {MessageEmbed} = require("discord.js");
        const {blue_dark} = require("../../config/bot/colors.json");
        const embed = new MessageEmbed()
            .setColor(blue_dark)
            .setTitle("Now Playing 🎵")
            .setDescription(`[${song.title}](${song.url})`)
            .addField("Length", song.duration, true)
            .addField("Requested by", song.requester, true)
            .addField("Up Next", queue.songLoop ? `${song.title} (loop)` : (queue.songs[1] ? queue.songs[1].title : "Nothing"), false)
            .setThumbnail(song.thumbnail);
        message.channel.send({embed});
      }
      else {
        message.channel.send(`**Now Playing 🎵**
        ${song.title}
        **Length:** ${song.duration}
        **Requested by:** ${song.requester}
        **Up Next:** ${queue.songLoop ? `${song.title} (loop)` : (queue.songs[1] ? queue.songs[1].title : "Nothing")}`);
      }
    }

    if (serverConfig.music.channelTopicChangeEnabled) {
      message.channel.setTopic(`**Now Playing:**  \n${song.title} [${song.duration}]`).catch(console.error);
    }
  },

  secondsToTime: (videoLength) => {
    const hrs = Math.trunc(videoLength / 3600).toString();
    const min = Math.trunc((videoLength / 60) % 60).toString();
    const sec = (videoLength % 60).toString().padStart(2, '0');
    if (hrs < 1) { return `${min}:${sec}`; }
    return `${hrs}:${min.padStart(2, '0')}:${sec}`;
  }
}
