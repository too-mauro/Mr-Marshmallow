/* This file contains many helper functions for many of the different commands
found within Mr. Marshmallow's code. */
module.exports = {
  createServerConfigFiles: (botConfigFile, serverID) => {
    const {existsSync, mkdirSync, writeFileSync, copyFileSync} = require("fs");
    if (existsSync(`./config/server/${serverID}/`)) return;
    try {
      mkdirSync(`./config/server/${serverID}/`);
      // Create the config.json file using default data from the bot's settings.json file.
      // This handles the server's prefix, DoorMat, CorkBoard, word filter, games, and music settings.
      const serverConfig = {
        prefix: botConfigFile.defaults.prefix,
        doormat: {
          enabled: false,
          channelID: null,
          welcomeMessage: botConfigFile.defaults.joinMessage,
          leaveMessage: botConfigFile.defaults.leaveMessage,
          banMessage: botConfigFile.defaults.banMessage
        },
        corkboard: {
          enabled: false,
          channelID: null,
          pinMode: botConfigFile.defaults.pinMode,
          pinThreshold: botConfigFile.defaults.pinThreshold,
          allowNSFW: false,
          maxDenyListSize: botConfigFile.defaults.maxDenyListSize
        },
        wordfilter: {
          enabled: false,
          maxDenyListSize: botConfigFile.defaults.maxDenyListSize,
          warnings: {
            enabled: false,
            message: botConfigFile.defaults.warnMessage,
            warnType: botConfigFile.defaults.warnType
          }
        },
        music: {
          nowPlayingEnabled: true,
          embedEnabled: true,
          channelTopicChangeEnabled: true,
          voteSkipEnabled: false
        },
        games: {
          triviaCmEnabled: false,
          maxLobbyPlayers: botConfigFile.defaults.maxLobbyPlayers,
          maxLobbyRounds: botConfigFile.defaults.maxLobbyRounds
        },
        maxQuotes: botConfigFile.defaults.maxQuotes
      };

      // Copy the default denylist.json file into the server's configuration folder. This file handles the non-allowed words and CorkBoard channels for the server.
      // Copy the default quotes.json file into the server's quotes.json file.
      writeFileSync(`./config/server/${serverID}/config.json`, JSON.stringify(serverConfig, null, 1), "utf8");
      copyFileSync("./config/bot/defaults/denylist.json", `./config/server/${serverID}/denylist.json`);
      copyFileSync("./config/bot/defaults/quotes.json", `./config/server/${serverID}/quotes.json`);
    }
    catch (err) {
      console.error("Failed to create server configuration files!\n", err);
    }
  },
  removeEndingZeroes: (version) => {
    // Recursively remove any ending zeroes from the string.
    let versionArray = version.split(".").reverse();
    if (!isNaN(versionArray[0]) && versionArray[0] < 1) {
      versionArray.shift();
      return versionArray.reverse().join(".");
    }
    else return version;
  },
  getUserFromMention: (mention, guild) => {
    // Gets the user's ID (second entry) from a mention.
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return;
    return guild.members.cache.get(matches[1]);
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
    const {readFileSync} = require("fs");
    const ytdl = require("ytdl-core");
    let serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
    const queue = bot.musicQueues.get(message.guild.id);
    if (!queue.songs[0]) {
      if (serverConfig.music.nowPlayingEnabled && serverConfig.music.channelTopicChangeEnabled) {
        message.channel.setTopic("Nothing's playing in here right now...").catch(console.error);
      }
      return setTimeout(() => {
        queue.voiceChannel.leave();
        bot.musicQueues.delete(message.guild.id);
      }, 500);
    }
    let stream = null;
    try {
      // an audio quality of 95 works best for live-streamed videos, while 251 works for non-live ones
      // this operator checks whether the queued video is live (has a queue duration of 0 as determined in the play command)
      let audioQuality = (queue.songs[0].duration == "LIVE") ? "95" : "251";
      stream = ytdl(queue.songs[0].url, { filter: "audio", highWaterMark: 1 << 25, volume: false, quality: audioQuality });
    }
    catch (err) {
      console.error(err);
      message.channel.send(`Whoops, I couldn't play **${queue.songs[0].title}**! (${err.message ? err.message : err})`);
      if (queue) {
        queue.songs.shift();
        module.exports.playSong(bot, queue.songs[0], message);
      }
      return;
    }

    try {
      const dispatcher = queue.connection.play(stream)
        .on("start", () => {
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
        })
        .on("finish", () => {
          queue.votersToSkip.length = 0; // reset vote count

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
          message.channel.send(`Whoops, I couldn't play **${queue.songs[0].title}**! (${err.message ? err.message : err})`);
          queue.songs.shift();
          module.exports.playSong(bot, queue.songs[0], message);
        });
      dispatcher.setVolumeLogarithmic(1);
    }
    catch (err) {
      if (queue) {
        queue.songs.shift();
        module.exports.playSong(bot, queue.songs[0], message);
      }
      console.error(err);
      return message.channel.send(`Whoops, I couldn't play **${queue.songs[0].title}**! (${err.message ? err.message : err})`);
    }
  },
  secondsToTime: (videoLength) => {
    const hrs = Math.trunc(videoLength / 3600).toString();
    const min = Math.trunc((videoLength / 60) % 60).toString();
    const sec = (videoLength % 60).toString().padStart(2, "0");
    if (hrs < 1) return `${min}:${sec}`;
    return `${hrs}:${min.padStart(2, "0")}:${sec}`;
  },
  restrictedWordsFiltered: (message, serverConfig) => {
    if (!serverConfig.wordfilter.enabled) return false;   // word filter is turned off

    const {readFileSync} = require("fs");
    const serverDenyList = JSON.parse(readFileSync(`./config/server/${message.guild.id}/denylist.json`, "utf8"));
    let restrictedWords = serverDenyList.wordfilter.filter(word => message.content.toLowerCase().trim().split(/ +/g).includes(word));
    if (restrictedWords.length < 1) return false;   // no restricted words were found

    if (message.guild.me.permissionsIn(message.channel).has("MANAGE_MESSAGES")) message.delete();
    else message.channel.send("I couldn't delete the message with the restricted word(s)!");
    if (serverConfig.wordfilter.warnings.enabled) {
      if (serverConfig.wordfilter.warnings.warnType == "channel") {
        message.channel.send(serverConfig.wordfilter.warnings.message.replace(/<user>/g, message.author));
      }
      else if (serverConfig.wordfilter.warnings.warnType == "dm") {
        message.author.send(serverConfig.wordfilter.warnings.message.replace(/<user>/g, message.author));
        message.channel.send(`${message.author} has been warned for using a restricted word!`);
      }
    }
    return true;  // some restricted words were found
  }
}
