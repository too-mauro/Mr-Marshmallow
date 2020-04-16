/*
This grabs information about the person who invoked the command, or about another
member of the server if they are mentioned.
*/

const discord = require("discord.js");
const { red_light } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "userinfo",
        description: "Gives information about yourself or a user.",
        usage: ["(@mention)"],
        category: "miscellaneous",
        aliases: ["ui"]
    },
    run: async (bot, message, args) => {

      let member;
      if (!args || args.length < 1) { member = message.guild.members.cache.get(message.author.id); }
      else {
      		member = getUserFromMention(args[0], message.guild);
      		if (!member) {
      			return message.channel.send(`**${message.author.username}**, please use a proper mention if you want to see someone else's information.`);
      		}
      }

      let embed = new discord.MessageEmbed()
          .setColor(red_light)
          .setAuthor(member.user.tag, member.user.displayAvatarURL())
          .setThumbnail(member.user.displayAvatarURL())
          .addField("**ID:**", `${member.id}`, true);

      // write out "do not disturb" if the user set themselves to dnd
      if (member.presence.status == "dnd") {
        embed.addField("**Status:**", "do not disturb", true);
      }
      else {
        embed.addField("**Status:**", `${member.presence.status}`, true);
      }
      embed.addField("**Joined Discord On:**", `${member.user.createdAt}`, false)
      .addField("**Joined the Server On:**", `${member.joinedAt}`, false)

      var roles = member.roles.cache.filter(r => r.id !== message.guild.id);
      if (roles.size < 1) {
        embed.addField("**Roles:**", "No roles!", false);
      }
      else {
        embed.addField(`**Roles (${roles.size}):**`, roles.map(r => r).sort((a, b) => b.position - a.position || b.id - a.id).join(" "), false);
      }

      if (member == message.guild.owner) { embed.setDescription("**Server Owner**", false); }
      embed.setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());
      return message.channel.send(embed);

    }
}

function getUserFromMention(mention, guild) {
  // The id is the first and only match found by the RegEx.
  const matches = mention.match(/^<@!?(\d+)>$/);
  // If supplied variable was not a mention, matches will be null instead of an array.
  if (!matches) return;
  // However the first element in the matches array will be the entire mention, not just the ID,
  // so use index 1.
  const id = matches[1];
  return guild.members.cache.get(id);
}
