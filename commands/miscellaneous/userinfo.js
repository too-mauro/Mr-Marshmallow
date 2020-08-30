/*
This grabs information about the person who invoked the command, or about another
member of the server if they are mentioned.
*/

const { MessageEmbed } = require("discord.js");
const { red_light } = require("../../config/bot/colors.json");
const { getUserFromMention } = require("../../config/bot/util.js");

module.exports = {
    config: {
        name: "userinfo",
        description: "Gives information about yourself or a user.",
        usage: "(@mention)",
        category: "miscellaneous",
        aliases: ["ui"]
    },
    run: async (bot, message, args) => {

      let member;
      if (!args || args.length < 1) { member = message.member; }
      else {
      		member = getUserFromMention(args[0], message.guild);
      		if (!member) {
      			return message.channel.send(`**${message.author.username}**, please use a proper mention if you want to see someone else's information.`);
      		}
      }

      let embed = new MessageEmbed()
          .setColor(red_light)
          .setAuthor(member.user.tag, member.user.displayAvatarURL())
          .setThumbnail(member.user.displayAvatarURL())
          .addField("**ID:**", member.id, true);

      // write out "do not disturb" if the user set themselves to dnd
      embed.addField("**Status:**", (member.presence.status == "dnd") ? "do not disturb" : member.presence.status, true)
      .addField("**Joined Discord On:**", member.user.createdAt, false)
      .addField(`**Joined ${message.guild.name} On:**`, member.joinedAt, false);
      if (member.premiumSince) embed.addField(`**Boosting ${message.guild.name} Since:**`, member.premiumSince, false);

      // List out the user's roles, if any, from highest to lowest rank
      const roles = member.roles.cache.filter(r => r.id !== message.guild.id);
      embed.addField(`**Roles (${roles.size}):**`, (roles.size > 0) ? roles.map(r => r).sort((a, b) => b.position - a.position || b.id - a.id).join(" ") : "No roles!", false);

      if (member == message.guild.owner) { embed.setDescription("**Server Owner**", false); }
      embed.setFooter(bot.user.username, bot.user.displayAvatarURL());
      return message.channel.send(embed);

    }
}
