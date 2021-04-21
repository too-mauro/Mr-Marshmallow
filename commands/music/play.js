/* This command plays music. If there is a queue, the song requested (via playlist, direct link, or search)
is added to the end. Otherwise, the bot joins the voice channel (if not already in one) and starts playing
the requested music. */

const {readFileSync} = require("fs");
const {validateURL, getInfo} = require("ytdl-core");
const yts = require("yt-search");
const ytpl = require("ytpl");
const {playSong, secondsToTime} = require("../../config/bot/util.js");
const {MessageEmbed} = require("discord.js");
const {blue_dark} = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "play",
        description: "Play a song or playlist, or find something to play!",
        usage: "<song search or link>",
        aliases: ["p"],
        category: "music"
    },
    run: async (bot, message, args) => {

      // Check if bot can join voice channels
      if (!message.guild.me.hasPermission("CONNECT") || !message.guild.me.hasPermission("SPEAK")) {
        return message.channel.send(`**${message.author.username}**, I need both the \`Connect\` and \`Speak\` permissions to join a voice channel!`);
      }

      // Check if user is in a voice channel, the bot can join it, if it's full, and if the bot and the user are in the same voice channel
      if (!message.member.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
      }
      else if (!message.member.voice.channel.joinable) {
        return message.channel.send(`**${message.author.username}**, I can't join \`${message.member.voice.channel.name}\`! Do I not have permission to join it...?`);
      }
      else if (message.member.voice.channel.full && !message.guild.me.hasPermission("MOVE_MEMBERS")) {
        return message.channel.send(`**${message.author.username}**, I can't join \`${message.member.voice.channel.name}\` because it's full! Please either make some room for me or give me the \`Move Members\` permission.`);
      }
      else if (message.guild.me.voice.channel && (message.member.voice.channel !== message.guild.me.voice.channel)) {
        return message.channel.send(`**${message.author.username}**, you need to be in the same voice channel to use this command!`);
      }

      if (!args || args.length < 1) {
        return message.channel.send(`**${message.author.username}**, please enter a link or a query to search!`);
      }

      const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
      let query = args.join(" ");
      let song = null;
      const serverQueue = bot.musicQueues.get(message.guild.id);
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: message.member.voice.channel,
        connection: null,
        songs: [],
        queueLoop: false,
        songLoop: false,
        totalLength: 0,
        playing: true,
        votersToSkip: []
      };

      // Check if the bot's currently bound to a certain text channel for songs.
      if (serverQueue && serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now and can only add songs there!`);
      }

      // Remove the < > characters if they are at the start and end of the query to suppress the auto-generated embed. This ensures the playlist feature works as intended.
      if (query.charAt(0) == "<" && query.charAt(query.length - 1) == ">") {
        query = query.slice(1, query.length - 1);
      }

      if (validateURL(query)) {
        // If the user enters a valid URL, add it to queue.
        try {
          let songInfo = await getInfo(query);
          let details = songInfo.player_response.videoDetails;
          if (!details.isLive && longVideo(details.lengthSeconds)) {
            return message.channel.send(`Sorry, I couldn't add ${songInfo.playerResponse.videoDetails.title} because it's longer than 3 hours.`);
          }
          song = {
            title: details.title,
            url: `https://www.youtube.com/watch?v=${details.videoId}`,
            duration: details.isLive ? "LIVE" : secondsToTime(details.lengthSeconds),
            queueDuration: details.isLive ? 0 : parseInt(details.lengthSeconds),
            thumbnail: details.thumbnail.thumbnails[0].url,
            requester: message.member.nickname ? `${message.member.nickname} (${message.author.tag})` : message.author.tag
          };
        }
        catch (err) {
          console.error(err);
          return message.channel.send(`Sorry, **${message.author.username}**, I couldn't add the song! Maybe it's a private video or deleted...?`);
        }
      }
      else if (ytpl.validateID(query)) {
        // if this is a playlist, get every item and add to queue
        let playlist = await ytpl(query, { limit: Infinity });
        playlist.items.forEach(entry => {
          // live videos return a null duration
          if (!entry.isLive && longVideo(entry.duration)) {
            return message.channel.send(`Sorry, I couldn't add ${entry.title} because it's longer than 3 hours.`);
          }
          try {
            song = {
              title: entry.title,
              url: entry.url,
              duration: entry.duration ? entry.duration : "LIVE",
              queueDuration: entry.duration ? timeToSeconds(entry.duration) : 0,
              thumbnail: entry.thumbnails[0].url,
              requester: message.member.nickname ? `${message.member.nickname} (${message.author.tag})` : message.author.tag
            };

            if (serverQueue) {
              serverQueue.songs.push(song);
              serverQueue.totalLength += song.queueDuration;
            }
            else {
              queueConstruct.songs.push(song);
              queueConstruct.totalLength += song.queueDuration;
            }
          }
          catch (err) {
            console.error(err);
            message.channel.send("Sorry, I couldn't add a song! Perhaps it's private or deleted...?");
          }
        });

        if (serverConfig.music.embedEnabled) {
          const embed = new MessageEmbed()
            .setColor(blue_dark)
            .setTitle("Added to Queue")
            .setDescription(`[${playlist.title}](${playlist.url})`)
            .addField("Description", playlist.description ? playlist.description : "No description available.", false)
            .addField("View Count", playlist.views, true)
            .addField("\u200b", "\u200b", true)
            .addField("Song Count", playlist.estimatedItemCount, true)
            .addField("Requested by", message.member.nickname ? `${message.member.nickname} (${message.author.tag})` : message.author.tag, true)
            .setThumbnail(playlist.thumbnails[0].url)
            .setFooter(playlist.lastUpdated);
          message.channel.send({embed});
        }
        else {
          message.channel.send(`**Added to Queue**\n${playlist.title} (${playlist.url})\n**Description:** ${playlist.description ? playlist.description : "None available."}\n**View Count:** ${playlist.views}\n**Song Count:** ${playlist.estimatedItemCount}\n${playlist.lastUpdated}`);
        }

        if (!serverQueue) {
          bot.musicQueues.set(message.guild.id, queueConstruct);
          try {
            if (message.guild.me.voice.channel) {
              message.channel.send(`Now taking more requests in ${queueConstruct.textChannel}!`);
            }
            else {
              message.channel.send(`Joined \`${queueConstruct.voiceChannel.name}\` and taking more requests in ${queueConstruct.textChannel}!`);
            }
            queueConstruct.connection = await message.member.voice.channel.join();
            playSong(bot, queueConstruct.songs[0], message);
          }
          catch (error) {
            console.error(error);
            bot.musicQueues.delete(message.guild.id);
            await queueConstruct.voiceChannel.leave();
            return message.channel.send(`Could not join the channel: ${error}`).catch(console.error);
          }
        }
        return;
      }
      else {
        // Find the first video from the search query.
        try {
          let search = await yts(query);
          const result = search.all[0];
          if (!result.url) {
            return message.channel.send(`**${message.author.username}**, I couldn't find a song with that search term! Please try again.`);
          }
          else if (result.duration && longVideo(result.duration.seconds)) {
            // again, live videos return a null duration (same as playlist)
            return message.channel.send(`Sorry, I couldn't add ${result.title} because it's longer than 3 hours.`);
          }
          song = {
            title: result.title,
            url: result.url,
            duration: result.duration ? result.duration.timestamp : "LIVE",
            queueDuration: result.duration ? parseInt(result.duration.seconds) : 0,
            thumbnail: result.thumbnail,
            requester: message.member.nickname ? `${message.member.nickname} (${message.author.tag})` : message.author.tag
          };
        }
        catch (err) {
          console.error(err);
          return message.channel.send(`Sorry, **${message.author.username}**, I couldn't add the song! Maybe the one I found is a private video or deleted...?`);
        }
      }

      if (serverQueue) {
        serverQueue.songs.push(song);
        serverQueue.totalLength += song.queueDuration; // <-- the total length entry is used for the queue
        if (serverConfig.music.embedEnabled) {
          const embed = new MessageEmbed()
            .setColor(blue_dark)
            .setTitle("Added to Queue")
            .setDescription(`[${song.title}](${song.url})`)
            .addField("Song Duration", song.duration, true)
            .addField("Requested by", song.requester, true)
            .addField("Position in Queue", serverQueue.songs.length - 1, true)
            .addField("Estimated Time Until Play", secondsToTime(serverQueue.totalLength))
            .setThumbnail(song.thumbnail);
          return message.channel.send({embed});
        }
        else {
          return message.channel.send(`**Added to Queue**\n${song.title}\n**Song Duration:** ${song.duration}\n**Requested by:** ${song.requester}\n**Position in Queue**: ${serverQueue.songs.length - 1}\n**Estimated Time Until Play**: ${secondsToTime(serverQueue.totalLength)}`);
        }
      }
      else {
        queueConstruct.songs.push(song);
        queueConstruct.totalLength = song.queueDuration; // <-- there's nothing here, so make the total length the song's length
        bot.musicQueues.set(message.guild.id, queueConstruct);

        try {
          if (message.guild.me.voice.channel) {
            message.channel.send(`Now taking more requests in ${queueConstruct.textChannel}!`);
          }
          else {
            message.channel.send(`Joined \`${queueConstruct.voiceChannel.name}\` and taking more requests in ${queueConstruct.textChannel}!`);
          }
          queueConstruct.connection = await message.member.voice.channel.join();
          // Set an event listener here so the bot doesn't keep adding extra ones with every song played. Then, start playing!
          queueConstruct.connection.on("disconnect", () => {
            if (serverConfig.music.channelTopicChangeEnabled) {
              queueConstruct.textChannel.setTopic("Nothing's playing in here right now...").catch(console.error);
            }
            bot.musicQueues.delete(message.guild.id);
          });
          playSong(bot, queueConstruct.songs[0], message);
        }
        catch (error) {
          console.error(error);
          bot.musicQueues.delete(message.guild.id);
          await queueConstruct.voiceChannel.leave();
          return message.channel.send(`Could not join the channel: ${error}`).catch(console.error);
        }
      }

  }
}

function timeToSeconds(videoDuration) {
  /* Assumes a string that includes at least one semi-colon (:). Splits it into an
  array and multiplies every split entry by a power of 60. */
  if (!videoDuration.includes(":")) return videoDuration;
  let seconds = 0;
  const timeArray = videoDuration.split(":").reverse();
  timeArray.forEach((time, exp) => seconds += parseInt(time) * Math.pow(60, exp));
  return seconds;
}

function longVideo(videoLength) {
  // Check if the video in question is longer than 3 hours.
  if (isNaN(videoLength)) {
    let totalTime = videoLength.split(":").reverse();
    return (totalTime[2] && totalTime[2] > 3);
  }
  else {
    return (Math.trunc(videoLength / 3600) > 3);
  }
}
