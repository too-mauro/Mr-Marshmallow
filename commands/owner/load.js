/*
This command loads a new command into memory, and can only be executed by the
bot owner defined in the config/bot/settings.json file.
*/

const { ownerID } = require("../../config/bot/settings.json");
const { getCategories } = require("../../config/bot/categories.js");
const { readdirSync } = require("fs");

module.exports = {
    config: {
        name: "load",
        description: "Loads a new bot command. Restricted to the bot owner.",
        category: "owner",
        usage: "<command>",
        aliases: []
    },
    run: async (bot, message, args) => {

      if (message.author.id != ownerID) return message.channel.send(`**${message.author.username}**, you must be the bot owner to run this command.`);
      else if (!args || args.length < 1) {
        return message.channel.send(`**${message.author.username}**, please provide the full name of a new command to load! (Don't enter an alias.)`);
      }

      args[0] = args[0].toLowerCase();
      if (bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]))) {
        return message.channel.send(`A command or alias with the name \`${args[0]}\` already exists!`);
      }

      let found = false;
      try {
        getCategories().forEach(dirs => {
            const commands = readdirSync(`./commands/${dirs}/`).filter(d => d.endsWith('.js'));
            for (let file of commands) {
              if (found) return;
              else if (file == `${args[0]}.js`) {
                let pull = require(`../../commands/${dirs}/${file}`);
                bot.commands.set(pull.config.name, pull);
                if (pull.config.aliases) pull.config.aliases.forEach(a => bot.aliases.set(a, pull.config.name));
                delete require.cache[require.resolve(`../../commands/${dirs}/${file}`)];
                return found = true;
              }
            }
        });
      }
      catch (e) {
        console.log(e);
        return message.channel.send(`Couldn't load the \`${args[0]}\` command.\n\`\`\`ERROR: ${e.message}\`\`\``);
      }
      if (!found) return message.channel.send(`A command with the name \`${args[0]}\` could not be found!`);
      else return message.channel.send(`Successfully loaded the \`${args[0]}\` command!`);
    }
}
