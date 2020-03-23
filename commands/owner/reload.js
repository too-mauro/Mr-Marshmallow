/*
This command reloads a given command, and can only be executed by the bot owner
defined in the config/bot/settings.json file.
*/

const { ownerID } = require("../../config/bot/settings.json");
const { readdirSync } = require("fs");

module.exports = {
    config: {
        name: "reload",
        description: "Reloads a bot command.",
        category: "owner",
        usage: "<command>",
        aliases: ["creload"]
    },
    run: async (bot, message, args) => {

    if (message.author.id != ownerID) return message.channel.send("You need to be the bot owner to run this command!");

    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, please provide a command to reload!`);
    }

    let command = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
    if (!command) {
      return message.channel.send(`A command or alias with the name \`${args[0]}\` doesn't exist!`);
    }

    delete require.cache[require.resolve(`../${command.config.category}/${command.config.name}.js`)];
    bot.commands.delete(command.config.name);
    try {
      let pull = require(`../${command.config.category}/${command.config.name}.js`);
      bot.commands.set(pull.config.name, pull);
      if (pull.config.aliases) pull.config.aliases.forEach(a => bot.aliases.set(a, pull.config.name));
    }
    catch(e) {
        console.log(e);
        return message.channel.send(`Sorry, I couldn't reload the \`${args[0]}\` command.`);
    }

    return message.channel.send(`Yeehaw! Successfully reloaded the \`${args[0]}\` command!`);
    }
}
