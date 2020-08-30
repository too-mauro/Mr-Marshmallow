/* This command returns an invite link to the support server, the bot, and a link
to the GitHub repository. */

const { MessageEmbed } = require("discord.js");
const { purple_light } = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "invite",
        category: "miscellaneous",
        description: "Useful links for joining the support server, inviting the bot, and checking out the GitHub code.",
        aliases: ["inv", "links", "link"],
        usage: ""
    },
    run: async (bot, message, args) => {

      let embed = new MessageEmbed()
          .setColor(purple_light)
          .setTitle(`${bot.user.username} Invites`)
          .setThumbnail(bot.user.displayAvatarURL())
          .addField("**Support Server**", "[Hang out in the Rockin' Treehouse!](https://discord.com/invite/UA6tK26)")
          .addField("**Bot Invite Link**", "Coming Soon! <:marshWink:696118146188181525>")
          .addField("**GitHub Repository**", "[Check out the source code!](https://github.com/too-mauro/Mr-Marshmallow)")
          .setFooter(bot.user.username, bot.user.displayAvatarURL());

      return message.channel.send(embed);
    }
}
