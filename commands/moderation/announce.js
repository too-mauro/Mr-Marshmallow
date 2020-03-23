module.exports = {
    config: {
        name: "announce",
        description: "sends a message that was inputted to a channel",
        usage: "m!announce",
        category: "moderation",
        accessableby: "Staff",
        aliases: ["acc", "announcement"]
    },
    run: async (bot, message, args) => {

    if(!message.member.hasPermission(["MANAGE_MESSAGES", "ADMINISTRATOR"])) return message.channel.send("You can't use this command!");
    
    let argsresult;
    let mChannel = message.mentions.channels.first();

    message.delete();
    if(mChannel) {
        argsresult = args.slice(1).join(" ");
        mChannel.send(argsresult);
    }
    else {
        argsresult = args.join(" ");
        message.channel.send(argsresult);
    }

    }
}