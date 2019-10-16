const { RichEmbed } = require("discord.js")
const { red_light } = require("../../colours.json");

module.exports = {
    config: {
        name: "userinfo",
        description: "Pulls either your or another user's information!",
        usage: "m!userinfo (@mention)",
        category: "miscellaneous",
        aliases: ["ui"]
    },
    run: async (bot, message, args) => {
    let uEmbed = new RichEmbed()
        .setColor(red_light)
        .setTitle("User Info")
        .setThumbnail(message.guild.iconURL)
        .setAuthor(`${message.author.username} Information`, message.author.displayAvatarURL)
        .addField("**Username:** ", `${message.author.username}`, true)
        .addField("**Discriminator:** ", `${message.author.discriminator}`, true)
        .addField("**ID:** ", `${message.author.id}`, true)
        .addField("**Status:** ", `${message.author.presence.status}`, true)
        .addField("**Created At:** ", `${message.author.createdAt}`, true)
        .setFooter(`Mr. Marshmallow | Footer`, bot.user.displayAvatarURL);

    message.channel.send(uEmbed);
    }
}
