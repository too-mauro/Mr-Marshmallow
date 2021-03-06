/*
This command returns information about the bot, specifically the number of users
it serves, the number of servers it's in, the API Latency, uptime, the server's
current prefix, and the bot's version (from the package.json file).
*/

const {readFileSync} = require("fs");
const {MessageEmbed} = require("discord.js");
const {cream} = require("../../config/bot/colors.json");
const {removeEndingZeroes} = require("../../config/bot/util.js");

module.exports = {
    config: {
        name: "botinfo",
        description: "Gets information about Mr. Marshmallow!",
        usage: "",
        aliases: ["bi", "binfo"],
        category: "miscellaneous"
    },
    run: async (bot, message, args) => {

      const version = JSON.parse(readFileSync("./package.json", "utf8")).version;
      const prefix = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8")).prefix;
      const embed = new MessageEmbed()
          .setColor(cream)
          .setTitle(`${bot.user.username} Info`)
          .setDescription("Loading information, hang tight...");
      message.channel.send({embed}).then(msg => {
        embed.setThumbnail(bot.user.displayAvatarURL())
            .setDescription(`Hanging out with ${bot.users.cache.size} users on ${bot.guilds.cache.size} servers!`)
            .addField("Current Uptime 🕐", readableUptime(bot.uptime), false)
            .addField("Bot Latency", `${msg.createdTimestamp - message.createdTimestamp} ms`, true)
            .addField("API Latency", `${Math.round(bot.ws.ping)} ms`, true)
            .addField("Server Prefix", `\` ${prefix} \``, true)
            .addField("Version", `**v${removeEndingZeroes(version)}**`, false)
            .setFooter(bot.user.username, bot.user.displayAvatarURL());
        return msg.edit({embed});
      });
    }
}

function readableUptime(uptime) {
  // Returns the bot's uptime as a human-understandable time format (d:h:m:s).
  const sec = Math.floor((uptime / 1000) % 60).toString();
  const min = Math.floor((uptime / (1000 * 60)) % 60).toString();
  const hrs = Math.floor(((uptime / (1000 * 60 * 60)) % 60) % 24).toString();
  const day = Math.floor((uptime / (1000 * 60 * 60 * 24)) % 60).toString();
  if (day < 1) {
    if (hrs < 1) return `${min.padStart(2, "0")}m : ${sec.padStart(2, "0")}s`;
    else return `${hrs}h : ${min.padStart(2, "0")}m : ${sec.padStart(2, "0")}s`;
  }
  return `${day}d : ${hrs.padStart(2, "0")}h : ${min.padStart(2, "0")}m : ${sec.padStart(2, "0")}s`;
}
