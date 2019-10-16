const { RichEmbed } = require("discord.js")
const { cyan } = require("../../colours.json");

module.exports = {
    config: {
        name: "serverinfo",
        description: "Pulls the server's information!",
        usage: "!serverinfo",
        category: "miscellaneous",
        aliases: ["si", "serverdesc", "sinfo"]
    },
    run: async (bot, message, args) => {
    let sEmbed = new RichEmbed()
        .setColor(cyan)
        .setTitle("Server Information")
        .setThumbnail(message.guild.iconURL)
        .setAuthor(`${message.guild.name} Information`, message.guild.iconURL)
        .addField("**Server Name:** ", `${message.guild.name}`, true)
        .addField("**Server Owner:** ", `${message.guild.owner}`, true)
        .addField("**Member Count:** ", `${message.guild.memberCount}`, true)
        .addField("**Role Count:** ", `${message.guild.roles.size}`, true)
        .setFooter(`Mr. Marshmallow | Footer`, bot.user.displayAvatarURL);
    message.channel.send(sEmbed);
    }
}