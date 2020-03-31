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
        usage: "<command>"
    },
    run: async (bot, message, args) => {

      if (message.author.id != ownerID) return;

      if (!args || args.length < 1) {
        return message.channel.send(`**${message.author.username}**, please provide a new command to load!`);
      }

      if (bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]))) {
        return message.channel.send(`A command or alias with the name \`${args[0]}\` already exists!`);
      }

      let found = 0;
      try {
        getCategories().forEach(dirs => {
            const commands = readdirSync(`./commands/${dirs}/`).filter(d => d.endsWith('.js'));
            for (let file of commands) {
                if (file === `${args[0]}.js`) {
                  let pull = require(`../${dirs}/${file}`);
                  bot.commands.set(pull.config.name, pull);
                  if (pull.config.aliases) pull.config.aliases.forEach(a => bot.aliases.set(a, pull.config.name));
                  return found = 1;
                }
                else if (found == 1) return;
            }
        });
      }
      catch (e) {
        console.log(e);
        return message.channel.send(`Couldn't unload the \`${command.config.name}\` command.\n\`\`\`ERROR: ${e.message}\`\`\``);
      }
      if (found == 0) return message.channel.send(`A command with the name \`${args[0]}\` could not be found!`);
      else return message.channel.send(`Successfully loaded the \`${args[0]}\` command!`);
    }
}
