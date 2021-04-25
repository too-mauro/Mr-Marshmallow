/* This command skips the currently playing song and plays the next one, if one is playing. */

const {playSong} = require("../../config/bot/util.js");
const {readFileSync} = require("fs");

module.exports = {
    config: {
        name: "skip",
        description: "Skips the currently playing song.",
        usage: "",
        aliases: ["sk"],
        category: "music"
    },
    run: async (bot, message, args) => {
      // Check if user is in a voice channel, the bot can join it, if it's full, and if the bot and the user are in the same voice channel
      if (!message.member.voice.channel) {
        return message.channel.send(`**${message.author.username}**, you need to be in a voice channel to use this command!`);
      }
      else if (message.guild.me.voice.channel && (message.member.voice.channel !== message.guild.me.voice.channel)) {
        return message.channel.send(`**${message.author.username}**, you need to be in the same voice channel to use this command!`);
      }

      const serverQueue = bot.musicQueues.get(message.guild.id);
      if (!serverQueue) {
        // there's no queue
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }
      else if (serverQueue.textChannel !== message.channel) {
        return message.channel.send(`Sorry **${message.author.username}**, I'm bound to ${serverQueue.textChannel} right now!`);
      }

      const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
      if (serverConfig.music.voteSkipEnabled) {
        let humanListenerCount = serverQueue.voiceChannel.members.filter(member => !member.user.bot).size;
        let votesNeededToSkip = calculateNeededVotes(humanListenerCount);
        if (humanListenerCount > 1 && serverQueue.votersToSkip.length < votesNeededToSkip) {
          let neededVotesLeft = votesNeededToSkip - serverQueue.votersToSkip.length;
          if (serverConfig.votersToSkip.includes(message.author.id)) {
            return message.channel.send(`Sorry **${message.author.username}**, you already voted to skip this song! (${neededVotesLeft} more ${(neededVotesLeft == 1) ? "vote" : "votes"} needed)`);
          }
          else {
            serverConfig.votersToSkip.push(message.author.id);
            return message.channel.send(`**${message.author.username}** voted to skip this song! (${neededVotesLeft} more ${(neededVotesLeft == 1) ? "vote" : "votes"} needed)`);
          }
        }
        else return skipSong();
      }
      else return skipSong();

      function skipSong() {
        serverQueue.votersToSkip.length = 0; // reset voter count
        message.channel.send(":track_next: Skipped!");
        if (serverQueue.queueLoop) {
          /* if loop is on, push the song back at the end of the queue
          so it can repeat endlessly */
          let lastSong = serverQueue.songs.shift();
          serverQueue.songs.push(lastSong);
          return playSong(bot, serverQueue.songs[0], message);
        }
        else if (serverQueue.songLoop) {
          // don't modify the queue and just repeat the first song
          return playSong(bot, serverQueue.songs[0], message);
        }
        else {
          // skip to the next song
          serverQueue.songs.shift();
          if (serverQueue.songs[0]) return playSong(bot, serverQueue.songs[0], message);
          else return playSong(bot, serverQueue.songs, message); // songs is just an empty array here, so pass that instead of songs[0]
        }
      }

    }
}

function calculateNeededVotes(listenerCount) {
  let halfOfAudience = listenerCount / 2;
  if (halfOfAudience % 2 > 0) halfOfAudience = Math.trunc(halfOfAudience);
  return halfOfAudience + 1;
}
