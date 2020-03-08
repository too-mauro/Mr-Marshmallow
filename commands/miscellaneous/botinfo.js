const fs = require('fs');
const discord = require("discord.js");
const { cream } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "botinfo",
        aliases: ["bi", "binfo"],
        usage: "",
        category: "miscellaneous",
        description: "Gets information about Mr. Marshmallow!"
    },
    run: async (bot, message, args) => {

      const configFile = require(`../../config/server/${message.guild.id}/config.json`);

      const embed = new discord.MessageEmbed()
          .setColor(cream)
          .setTitle(`${bot.user.username} Info`)
          .setThumbnail(bot.user.displayAvatarURL())
          .setDescription(`Hanging out with ${bot.users.cache.size} users on ${bot.guilds.cache.size} servers!`)
          .addField("Current Uptime :clock1:", `${duration(bot.uptime)}`, true)
          .addField("API Latency:", `${Math.round(bot.ws.ping)} ms`, true)
          .addField("Server Prefix:", configFile.prefix, true)
          .setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());

      return message.channel.send({embed});
    }
}

function duration(ms) {
    const sec = Math.floor((ms / 1000) % 60).toString()
    const min = Math.floor((ms / (1000 * 60)) % 60).toString()
    const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString()
    return `${hrs.padStart(2, '0')}h:${min.padStart(2, '0')}m:${sec.padStart(2, '0')}s`;
}
