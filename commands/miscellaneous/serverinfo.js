const discord = require("discord.js");
const { aqua } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "serverinfo",
        description: "Gets information about the server.",
        category: "miscellaneous",
        usage: "",
        aliases: ["si", "sinfo", "serverdesc"]
    },
    run: async (bot, message, args) => {
      let embed = new discord.MessageEmbed()
          .setColor(aqua)
          .setTitle(`${message.guild.name} Info`)
          .setThumbnail(message.guild.iconURL())
          .addField("**Server Name:**", `${message.guild.name}`, true)
          .addField("**Server Owner:**", `${message.guild.owner}`, true)
          .addField("**Member Count:**", `${message.guild.memberCount}`, true)
          .addField("**Role Count:**", `${message.guild.roles.cache.size}`, true)
          .addField("**Created On:**", `${message.guild.createdAt}`, true)
          .setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());
          
      return message.channel.send(embed);
    }
}
