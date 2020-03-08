const discord = require("discord.js");
const { red_light } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "userinfo",
        description: "Gives information about yourself or a user.",
        usage: "(@mention)",
        category: "miscellaneous",
        aliases: ["ui"]
    },
    run: async (bot, message, args) => {

      // grab a user's mention so we can get their info
      let member = message.guild.member(message.mentions.members.first());

      // if no mention, get message author's info
      if (!message.mentions.users.size) { member = message.author; }

      let embed = new discord.MessageEmbed()
          .setColor(red_light)
          .setTitle(`${member.username} Info`)
          .setThumbnail(member.displayAvatarURL())
          .addField("**Username:**", `${member.tag}`, true)
          .addField("**ID:**", `${member.id}`, true);

      // write out "do not disturb" if the user set themselves to dnd
      if (member.presence.status == "dnd") {
        embed.addField("**Status:**", "do not disturb", true);
      }
      else {
        embed.addField("**Status:**", `${member.presence.status}`, true);
      }

      embed.addField("**Created At:**", `${member.createdAt}`, true)
        .setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());



      return message.channel.send(embed);
    }
}
