/*
This command reloads a given command, and can only be executed by the bot owner
defined in the config/bot/settings.json file.
*/

const { owners } = require("../../config/bot/settings.json");
const { readdirSync } = require("fs");

module.exports = {
    config: {
        name: "reload",
        description: "Reloads a bot command. Restricted to the bot owner.",
        category: "owner",
        usage: "<command>",
        aliases: ["creload", "rel"]
    },
    run: async (bot, message, args) => {

      if (!owners.includes(message.author.id)) return message.channel.send(`**${message.author.username}**, you must be the bot owner to run this command.`);
      else if (!args || args.length < 1) {
        return message.channel.send(`**${message.author.username}**, please provide a command to reload!`);
      }

      args[0] = args[0].toLowerCase();
      let command = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
      if (!command) {
        return message.channel.send(`A command or alias with the name \`${args[0]}\` doesn't exist!`);
      }

      bot.commands.delete(command.config.name);
      try {
        let pull = require(`../${command.config.category}/${command.config.name}.js`);
        bot.commands.set(pull.config.name, pull);
        if (pull.config.aliases) pull.config.aliases.forEach(a => bot.aliases.set(a, pull.config.name));
        delete require.cache[require.resolve(`../${command.config.category}/${command.config.name}.js`)];
      }
      catch(e) {
          console.log(e);
          return message.channel.send(`Couldn't reload the \`${command.config.name}\` command.\n\`\`\`ERROR: ${e.message}\`\`\``);
      }

      return message.channel.send(`Successfully reloaded the \`${command.config.name}\` command!`);
    }
}
