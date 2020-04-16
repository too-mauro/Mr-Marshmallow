/*
This command unloads a given command from memory, and can only be executed by
the bot owner defined in the config/bot/settings.json file.
*/

const { ownerID } = require("../../config/bot/settings.json");
const { readdirSync } = require("fs");

module.exports = {
    config: {
        name: "unload",
        description: "Unloads a bot command. Restricted to the bot owner.",
        category: "owner",
        usage: ["<command>"],
        aliases: ["unl", "ul"]
    },
    run: async (bot, message, args) => {

        if (message.author.id != ownerID) return;

        if (!args || args.length < 1) {
          return message.channel.send(`**${message.author.username}**, please provide a command to unload!`);
        }

        args[0] = args[0].toLowerCase();
        let command = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
        if (!command) {
          return message.channel.send(`A command or alias with the name \`${args[0]}\` doesn't exist!`);
        }

        try {
          delete require.cache[require.resolve(`../${command.config.category}/${command.config.name}.js`)];
          bot.commands.delete(command.config.name);
        }
        catch(e) {
            console.log(e);
            return message.channel.send(`Couldn't unload the \`${command.config.name}\` command.\n\`\`\`ERROR: ${e.message}\`\`\``);
        }

        return message.channel.send(`Successfully unloaded the \`${command.config.name}\` command!`);
    }
}
