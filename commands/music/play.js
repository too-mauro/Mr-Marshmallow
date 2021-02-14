/* This command plays music. If there is a queue, the song requested (via playlist, direct link, or search)
is added to the end. Otherwise, the bot joins the voice channel (if not already in one) and starts playing
the requested music. */

const fs = require("fs");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytpl = require("ytpl");
const { playSong, secondsToTime } = require("../../config/bot/util.js");
const { MessageEmbed } = require("discord.js");
const { blue_dark } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "play",
        aliases: ["p"],
        usage: "<song search or link>",
        category: "music",
        description: "Play a song or playlist, or find something to play!"
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

      const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
      let query = args.join(" ");
      let song = null;
      const serverQueue = bot.queue.get(message.guild.id);
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: message.member.voice.channel,
        connection: null,
        songs: [],
        queueLoop: false,
        songLoop: false,
        totalLength: 0,
        volume: 100,
        playing: true
      };

      // Check if the bot's currently bound to a certain text channel for songs.
      if (serverQueue && serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now and can only add songs there!`);
      }

      // Remove the < > characters if they are at the start and end of the query to suppress the auto-generated embed. This ensures the playlist feature works as intended.
      if (query.charAt(0) == "<" && query.charAt(query.length - 1) == ">") {
        query = query.slice(1, query.length - 1);
      }

      if (ytdl.validateURL(query)) {
        // If the user enters a valid URL, add it to queue.
        try {
          let songInfo = await ytdl.getInfo(query);
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
          console.log(err);
          return message.channel.send(`Sorry, **${message.author.username}**, I couldn't add the song! Maybe it's a private video or deleted...?`);
        }
      }
      else if (ytpl.validateID(query)) {
        // if this is a playlist, get every item and add to queue
        let playlist = await ytpl(query, { limit: Infinity });
        for (let p = 0; p < playlist.items.length; p++) {
          // live videos return a null duration
          if (!playlist.items[p].isLive && longVideo(playlist.items[p].duration)) {
            message.channel.send(`Sorry, I couldn't add ${playlist.items[p].title} because it's longer than 3 hours.`);
            continue;
          }
          try {
            song = {
              title: playlist.items[p].title,
              url: playlist.items[p].url,
              duration: playlist.items[p].duration ? playlist.items[p].duration : "LIVE",
              queueDuration: playlist.items[p].duration ? timeToSeconds(playlist.items[p].duration) : 0,
              thumbnail: playlist.items[p].thumbnails[0].url,
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
            console.log(err);
            message.channel.send("Sorry, I couldn't add a song! Perhaps it's private or deleted...?");
          }
        }

        if (serverConfig.music.embedEnabled) {
          const embed = new MessageEmbed()
            .setColor(blue_dark)
            .setTitle("Added to Queue")
            .setDescription(`[${playlist.title}](${playlist.url})`)
            .addField("Description", playlist.description ? playlist.description : "None available.", false)
            .addField("View Count", playlist.views, true)
            .addField("Last Updated", playlist.lastUpdated, true)
            .addField("Song Count", playlist.estimatedItemCount, false)
            .setThumbnail(playlist.thumbnails[0].url);
          message.channel.send({embed});
        }
        else {
          message.channel.send(`**Added to Queue**\n${playlist.title} (${playlist.url})\n**Description:** ${playlist.description ? playlist.description : "None available."}\n**View Count:** ${playlist.views}\n**Last Updated:** ${playlist.lastUpdated}\n**Song Count:** ${playlist.estimatedItemCount}`);
        }

        if (!serverQueue) {
          bot.queue.set(message.guild.id, queueConstruct);
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
            bot.queue.delete(message.guild.id);
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
          console.log(err);
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
            .addField("Length", song.duration, true)
            .setThumbnail(song.thumbnail);
          return message.channel.send({embed});
        }
        else {
          return message.channel.send(`**Added to Queue**
          ${song.title}
          **Length:** ${song.duration}`);
        }
      }
      else {
        queueConstruct.songs.push(song);
        queueConstruct.totalLength = song.queueDuration; // <-- there's nothing here, so make the total length the song's length
        bot.queue.set(message.guild.id, queueConstruct);

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
            bot.queue.delete(message.guild.id);
          });
          playSong(bot, queueConstruct.songs[0], message);
        }
        catch (error) {
          console.error(error);
          bot.queue.delete(message.guild.id);
          await queueConstruct.voiceChannel.leave();
          return message.channel.send(`Could not join the channel: ${error}`).catch(console.error);
        }
      }

  }
}

function timeToSeconds(videoDuration) {
  // This assumes an array of three numbers separated with a colon (the format is H:M:S).
  // Grab the hours and multiply it by 3600 (hours to minutes, then minutes to seconds).
  // Then, get the minutes and multiply by 60 (minutes to seconds).
  // Lastly, add the seconds which already exist.
  let seconds = 0;
  const timeArray = videoDuration.split(":").reverse();
  timeArray[0] = parseInt(timeArray[0]);
  if (timeArray[1]) { timeArray[1] = parseInt(timeArray[1]) * 60; }
  if (timeArray[2]) { timeArray[2] = parseInt(timeArray[2]) * 3600; }
  for (let i = 0; i < timeArray.length; i++) { seconds += timeArray[i]; };
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
