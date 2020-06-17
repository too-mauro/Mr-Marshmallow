/*
This command returns information about the bot, specifically the number of users
it serves, the number of servers it's in, the API Latency, uptime, the server's
current prefix, and the bot's version (from the package.json file).
*/

const fs = require("fs");
const discord = require("discord.js");
const { cream } = require("../../config/bot/colors.json");
const version = JSON.parse(fs.readFileSync("./package.json", "utf8")).version;

module.exports = {
    config: {
        name: "botinfo",
        aliases: ["bi", "binfo"],
        usage: "",
        category: "miscellaneous",
        description: "Gets information about Mr. Marshmallow!"
    },
    run: async (bot, message, args) => {

      const prefix = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8')).prefix;
      const embed = new discord.MessageEmbed()
          .setColor(cream)
          .setTitle(`${bot.user.username} Info`)
          .setDescription("Loading information, hang tight...");
      message.channel.send({embed}).then(m => {
        embed.setThumbnail(bot.user.displayAvatarURL())
            .setDescription(`Hanging out with ${bot.users.cache.size} users on ${bot.guilds.cache.size} servers!`)
            .addField("Current Uptime 🕐", readableUptime(bot.uptime), false)
            .addField("Bot Latency", `${m.createdTimestamp - message.createdTimestamp} ms`, true)
            .addField("API Latency", `${Math.round(bot.ws.ping)} ms`, true)
            .addField("Server Prefix", `\` ${prefix} \``, true)
            .addField("Version", `**v${removeEndingZeroes(version)}**`, false)
            .setFooter(bot.user.username, bot.user.displayAvatarURL());
        return m.edit({embed});
      });
    }
}

function readableUptime(uptime) {
  // Returns the bot's uptime as a human-understandable time format (d:h:m:s).
  let sec = Math.floor((uptime / 1000) % 60).toString();
  let min = Math.floor((uptime / (1000 * 60)) % 60).toString();
  let hrs = Math.floor((uptime / (1000 * 60 * 60)) % 60).toString();
  let day = Math.floor((uptime / (1000 * 60 * 60 * 24)) % 60).toString();
  if (day < 1) {
    if (hrs < 1) return `${min.padStart(2, '0')}m : ${sec.padStart(2, '0')}s`;
    return `${hrs}h : ${min.padStart(2, '0')}m : ${sec.padStart(2, '0')}s`;
  }
  return `${day}d : ${hrs % 24}h : ${min.padStart(2, '0')}m : ${sec.padStart(2, '0')}s`;
}

function removeEndingZeroes(version) {
  // If the third digit in the version number is 0, remove it from the string. Otherwise, leave it alone.
  if (version.split(".")[2] == 0) return version.slice(0, version.length - 2);
  return version;
}
