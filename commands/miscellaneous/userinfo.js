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
        usage: "(@mention)",
        category: "miscellaneous",
        aliases: ["ui"]
    },
    run: async (bot, message, args) => {

      if (args[0]) {
    		const member = getUserFromMention(args[0]);
    		if (!member) {
    			return message.channel.send(`**${message.author.username}**, please use a proper mention if you want to see someone else's information.`);
    		}

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
        embed.addField("**Created On:**", `${member.createdAt}`, true)
          .setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());
        return message.channel.send(embed);
      }

      let embed = new discord.MessageEmbed()
          .setColor(red_light)
          .setTitle(`${message.author.username} Info`)
          .setThumbnail(message.author.displayAvatarURL())
          .addField("**Username:**", `${message.author.tag}`, true)
          .addField("**ID:**", `${message.author.id}`, true);

      // write out "do not disturb" if the user set themselves to dnd
      if (message.author.presence.status == "dnd") {
        embed.addField("**Status:**", "do not disturb", true);
      }
      else {
        embed.addField("**Status:**", `${message.author.presence.status}`, true);
      }
      embed.addField("**Created On:**", `${message.author.createdAt}`, true)
        .setFooter(`${bot.user.username}`, bot.user.displayAvatarURL());
      return message.channel.send(embed);


      function getUserFromMention(mention) {
      	// The id is the first and only match found by the RegEx.
      	const matches = mention.match(/^<@!?(\d+)>$/);

      	// If supplied variable was not a mention, matches will be null instead of an array.
      	if (!matches) return;

      	// However the first element in the matches array will be the entire mention, not just the ID,
      	// so use index 1.
      	const id = matches[1];

      	return bot.users.cache.get(id);
      }
    }
}
