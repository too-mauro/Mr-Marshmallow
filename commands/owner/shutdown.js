const { ownerID } = require("../../botsettings.json");

module.exports = {
    config: {
        name: "shutdown",
        description: "Shuts down the bot!",
        usage: `m!shutdown`,
        category: "owner",
        aliases: ["botstop"]
    },
    run: async (bot, message, args) => {

    if(message.author.id != ownerID) return message.channel.send("You're not the bot owner!")

    try {
        await message.channel.send("Mr. Marshmallow is shutting down...");
        process.exit();
    }
    catch(e) {
        message.channel.send(`ERROR: ${e.message}`);
    }

    }
}
