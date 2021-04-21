/*
This command shows information about the current server, such as the server owner,
how many members and roles there are, when the server was created, and how many
server boosts (and level, if applicable) it has.
*/

const {MessageEmbed} = require("discord.js");
const {aqua} = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "serverinfo",
        description: "Gets information about the server.",
        usage: "",
        aliases: ["si", "sinfo", "serverdesc"],
        category: "miscellaneous"
    },
    run: async (bot, message, args) => {
      let embed = new MessageEmbed()
          .setColor(aqua)
          .setTitle(`${message.guild.name} Info`)
          .setThumbnail(message.guild.iconURL())
          .addField("**Server Name:**", message.guild.name, true)
          .addField("**Server Owner:**", message.guild.owner, true)
          .addField("**Members:**", message.guild.memberCount, true)
          .addField("**Roles:**", message.guild.roles.cache.size, true)
          .addField("**Created On:**", message.guild.createdAt, true)
          .setFooter(bot.user.username, bot.user.displayAvatarURL());

      if (message.guild.premiumTier > 0) {
        embed.setDescription(`**${message.guild.premiumSubscriptionCount}** server boosts (**Level ${message.guild.premiumTier}**)`);
      }
      else {
        embed.setDescription(`**${message.guild.premiumSubscriptionCount}** server ${message.guild.premiumSubscriptionCount == 1 ? "boost" : "boosts"}`);
      }
      return message.channel.send(embed);
    }
}
