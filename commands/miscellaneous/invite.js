module.exports = {
    config: {
        name: "invite",
        description: "Invite links for the bot and support server.",
        aliases: ["inv"]
    },
    run: async (bot, message, args) => {

      return message.channel.send("Need some help with something? Check out my server! https://discord.gg/PFBgYvj");
    }
}
