const { RichEmbed } = require("discord.js")
const { redlight } = require("../../colours.json");

module.exports = {
    config: {
        name: "unban",
        description: "Unban a user from the server!",
        usage: "m!unban",
        category: "moderation",
        aliases: ["ub", "unbanish"]
    },
    run: async (bot, message, args) => {

    if(!message.member.hasPermission(["BAN_MEMBERS", "ADMINISTRATOR"])) return message.channel.send("You don't have permission to perform this command!")

		
	if(isNaN(args[0])) return message.channel.send("You need to provide an ID.")
    let bannedMember = await bot.fetchUser(args[0])
        if(!bannedMember) return message.channel.send("Please provide a user ID to unban someone!")

    let reason = args.slice(1).join(" ")
        if(!reason) reason = "No reason given!"

    if(!message.guild.me.hasPermission(["BAN_MEMBERS", "ADMINISTRATOR"])) return message.channel.send("I don't have permission to perform this command!")|
    message.delete()
    try {
        message.guild.unban(bannedMember, reason);
        message.channel.send(`${bannedMember.tag} has been unbanned from the server!`);
    } catch(e) {
        console.log(e.message);
    }

    // send a message to mod log channel (might not use)
/*
    let embed = new RichEmbed()
    .setColor(redlight)
    .setAuthor(`${message.guild.name} Mod Logs`, message.guild.iconURL)
    .addField("Moderation: ", "unban")
    .addField("Moderated on: ", `${bannedMember.username} (${bannedMember.id})`)
    .addField("Moderator: ", message.author.username)
    .addField("Reason: ", reason)
    .addField("Date: ", message.createdAt.toLocaleString())
    
        let sChannel = message.guild.channels.find(c => c.name === "tut-modlogs");
        sChannel.send(embed);
*/

    }
}
