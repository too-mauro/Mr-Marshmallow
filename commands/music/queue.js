
const { MessageEmbed } = require("discord.js");
const { blue_dark } = require("../../config/bot/colors.json");
const { secondsToTime } = require("../../config/bot/util.js");

module.exports = {
    config: {
        name: "queue",
        aliases: ["qu", "pl", "playlist"],
        usage: "",
        category: "music",
        description: "Shows the queue."
    },
    run: async (bot, message, args) => {

      const serverQueue = bot.queue.get(message.guild.id);
      if (!serverQueue) {
        return message.channel.send(`**${message.author.username}**, there's nothing playing right now!`);
      }

      let pageLength = 6;  // <-- How many songs will show on one page. Can be set up to 10 to respect embed character limit and chat space.
      if (args[0] && !isNaN(args[0]) && 0 < Math.trunc(args[0]) && Math.trunc(args[0]) <= 10) { pageLength = Math.trunc(args[0]); }

      /* If the actual divided value is greater than the rounded one, truncate the decimals
      from the actual division, add 1, and use the resulting value. This ensures every song will show up. */
      let pages = Math.round(serverQueue.songs.length / pageLength);
      if ((serverQueue.songs.length / pageLength) > pages) { pages = Math.trunc(serverQueue.songs.length / pageLength) + 1; }
      let page = 1;
      let sPos = 0;

      let pLimit = Math.min(pageLength, serverQueue.songs.length);
      const embed = new MessageEmbed()
          .setColor(blue_dark)
          .setAuthor(`${message.guild.name} Queue`, message.guild.iconURL())
      for (sPos; sPos < pLimit; sPos++) {
        // Create a new embed field for each song
        if (sPos == 0) {
          embed.addField("Now Playing", `[${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
        }
        else if (sPos == 1) {
          embed.addField("Up Next", `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
        }
        else {
          embed.addField('\u200b', `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
        }
      }
      embed.setFooter(`Page ${page} / ${pages}  |  ${serverQueue.songs.length} total ${serverQueue.songs.length == 1 ? "song" : "songs"}  |  ${secondsToTime(serverQueue.totalLength)} total length`, bot.user.displayAvatarURL());
      if (serverQueue.songs.length <= pageLength) { return message.channel.send({embed}); }
      else {
        message.channel.send({embed}).then(msg => {
          msg.react("⬅").then(() => msg.react('➡'));
          const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id;
          const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id;

          const backwards = msg.createReactionCollector(backwardsFilter, {timer: 6000});
          const forwards = msg.createReactionCollector(forwardsFilter, {timer: 6000});

          backwards.on('collect', r => {
            if (page === 1) { page = pages; }
            else { page--; }
            if (page == 1) {
              embed.fields = [];
              sPos = 0;
              pLimit = Math.min(pageLength, serverQueue.songs.length);
              for (sPos; sPos < pLimit; sPos++) {
                // Create a new embed field for each song
                if (sPos == 0) {
                  embed.addField("Now Playing", `[${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
                }
                else if (sPos == 1) {
                  embed.addField("Up Next", `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
                }
                else {
                  embed.addField('\u200b', `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
                }
              }
            }
            else if (page == pages) {
              embed.fields = [];
              sPos = pageLength * (pages - 1);
              pLimit = Math.min(pageLength * pages, serverQueue.songs.length);
              for (sPos - pageLength; sPos < pLimit; sPos++) {
                embed.addField('\u200b', `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
              }
            }
            else {
              embed.fields = [];
              sPos = pageLength * (page - 1);
              pLimit = Math.min(pageLength * page, serverQueue.songs.length);
              for (sPos - pageLength; sPos < pLimit; sPos++) {
                embed.addField('\u200b', `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
              }
            }
            embed.setFooter(`Page ${page} / ${pages}  |  ${serverQueue.songs.length} total ${serverQueue.songs.length == 1 ? "song" : "songs"}  |  ${secondsToTime(serverQueue.totalLength)} total length`, bot.user.displayAvatarURL());
            msg.edit(embed);
          });

          forwards.on('collect', r => {
            if (page === pages) { page = 1; }
            else { page++; }
            if (page == 1) {
              embed.fields = [];
              sPos = 0;
              pLimit = Math.min(pageLength, serverQueue.songs.length);
              for (sPos; sPos < pLimit; sPos++) {
                // Create a new embed field for each song
                if (sPos == 0) {
                  embed.addField("Now Playing", `[${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
                }
                else if (sPos == 1) {
                  embed.addField("Up Next", `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
                }
                else {
                  embed.addField('\u200b', `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
                }
              }
            }
            else {
              embed.fields = [];
              pLimit = Math.min(pageLength * page, serverQueue.songs.length);
              for (sPos + pageLength; sPos < pLimit; sPos++) {
                embed.addField('\u200b', `${sPos}. [${serverQueue.songs[sPos].title}](${serverQueue.songs[sPos].url})\n**Length:** ${serverQueue.songs[sPos].duration}  |  **Requested by:** ${serverQueue.songs[sPos].requester}`);
              }
            }
            embed.setFooter(`Page ${page} / ${pages}  |  ${serverQueue.songs.length} total ${serverQueue.songs.length == 1 ? "song" : "songs"}  |  ${secondsToTime(serverQueue.totalLength)} total length`, bot.user.displayAvatarURL());
            msg.edit(embed);
          });

        });
      }

    }
}
