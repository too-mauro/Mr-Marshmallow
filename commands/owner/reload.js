const { ownerID } = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "reload",
        description: "Reloads a bot command.",
        category: "owner",
        usage: "<command>",
        aliases: ["creload"]
    },
    run: async (bot, message, args) => {

    if (message.author.id != ownerID) {
      return message.channel.send("You have to be the bot owner to run this command!");
    }

    if (!args || args.length < 1) {
      return message.channel.send("Please provide a command to reload!");
    }

    try {
        let commandName = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
        delete require.cache[require.resolve(`./${commandName}.js`)]; // usage !reload <name>
        bot.commands.delete(commandName);
        const pull = require(`./${commandName}.js`);
        bot.commands.set(commandName, pull);
    }
    catch(e) {
        return message.channel.send(`Sorry, I couldn't reload the \`${commandName}\` command.\n${e.message}`);
    }

    message.channel.send(`Yeehaw! Successfully reloaded the \`${commandName}\` command!`);

    }
}
