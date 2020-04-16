/*
This command returns an invite link to the support server.
*/

const discord = require("discord.js");
const { purple_light } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "invite",
        category: "miscellaneous",
        description: "Useful links for joining the support server, inviting the bot, and checking out the GitHub code.",
        aliases: ["inv", "links", "link"],
        usage: []
    },
    run: async (bot, message, args) => {

      let embed = new discord.MessageEmbed()
          .setColor(purple_light)
          .setTitle(`${bot.user.username} Invites`)
          .setThumbnail(bot.user.displayAvatarURL())
          .addField("**Support Server**", `[Join the Rockin' Treehouse!](https://discord.gg/UA6tK26)`)
          .addField("**Bot Invite Link**", `Coming Soon! <:marshWink:696118146188181525>`)
          .addField("**GitHub Repository**", `[${bot.user.username}](https://github.com/too-mauro/Mr-Marshmallow)`)
          .setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());

      return message.channel.send(embed);
    }
}
