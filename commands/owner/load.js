/* This command loads one or multiple new command(s) into the bot's command
list, and can only be executed by the bot owner(s) defined in the
config/bot/settings.json file. */

const {owners} = require("../../config/bot/settings.json");
const {statSync, readdirSync} = require("fs");

module.exports = {
    config: {
        name: "load",
        description: "Loads one or more new bot commands. Restricted to the bot owner.",
        usage: "<command>",
        aliases: ["l"],
        category: "owner"
    },
    run: async (bot, message, args) => {

      if (!owners.includes(message.author.id)) {
        return message.channel.send(`**${message.author.username}**, you must be the bot owner to run this command.`);
      }
      else if (!args || args.length < 1) {
        return message.channel.send(`**${message.author.username}**, please provide the full name of one or more new command to load! (Don't enter an alias.)`);
      }

      let successfulLoads = [];
      let failedLoads = [];
      args.forEach(cmdToLoad => {
          cmdToLoad = cmdToLoad.toLowerCase();
          if (bot.commands.get(cmdToLoad) || bot.commands.get(bot.aliases.get(cmdToLoad))) {
            console.error(`A command or alias with the name "${cmdToLoad}" already exists!`);
            return failedLoads.push({command: cmdToLoad, reason: "command/alias already exists"});
          }

          let found = false;
          try {
            readdirSync("./commands/").forEach(dir => {
              if (statSync(`./commands/${dir}/`).isDirectory()) {
                let commandList = readdirSync(`./commands/${dir}/`).filter(d => d.endsWith('.js'));
                for (let file of commandList) {
                  if (found) return;
                  else if (file == `${cmdToLoad}.js`) {
                    let command = require(`../../commands/${dir}/${file}`);
                    bot.commands.set(command.config.name, command);
                    if (command.config.aliases) {
                      command.config.aliases.forEach(alias => {
                        bot.aliases.set(alias, command.config.name);
                      });
                    }
                    delete require.cache[require.resolve(`../../commands/${dir}/${file}`)];
                    console.log(`Successfully loaded the "${command.config.name}" command.`);
                    successfulLoads.push(command.config.name);
                    found = true;
                    break;
                  }
                }
              }
            });

            if (!found) {
              console.error(`Could not find the "${cmdToLoad}" command!`);
              return failedLoads.push({command: cmdToLoad, reason: "command could not be found"});
            }
          }
          catch (err) {
            console.error(`Couldn't load the "${cmdToLoad}" command! ${err.message}`);
            failedLoads.push({command: cmdToLoad, reason: err.message});
          }
      });

      let result;
      let errorMsgs = "";
      for (let f = 0; f < failedLoads.length; f++) {
        errorMsgs += `${failedLoads[f].command}: ${failedLoads[f].reason}\n`;
      }

      if (successfulLoads.length > 0 && failedLoads.length < 1) {
        result = `Successfully loaded ${successfulLoads.length} command(s): \`${successfulLoads.join(", ")}\``;
      }
      else if (successfulLoads.length > 0 && failedLoads.length > 0) {
        result = `Successfully loaded ${successfulLoads.length} command(s): \`${successfulLoads.join(", ")}\`\nFailed to load ${failedLoads.length} command(s): \`\`\`${errorMsgs}\`\`\``;
      }
      else {
        result = `Failed to load ${failedLoads.length} command(s): \`\`\`${errorMsgs}\`\`\``;
      }
      return message.channel.send(result);

    }
}
