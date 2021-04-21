/* This command reloads one or multiple commands, and can only be executed by the
bot owner(s) defined in the config/bot/settings.json file. */

const {owners} = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "reload",
        description: "Reloads one or more bot commands. Restricted to the bot owner.",
        usage: "<command>",
        aliases: ["rel"],
        category: "owner"
    },
    run: async (bot, message, args) => {

      if (!owners.includes(message.author.id)) {
        return message.channel.send(`**${message.author.username}**, you must be the bot owner to run this command.`);
      }
      else if (!args || args.length < 1) {
        return message.channel.send(`**${message.author.username}**, please provide one or more commands to reload!`);
      }

      let successfulReloads = [];
      let failedReloads = [];
      args.forEach(cmdToReload => {
          cmdToReload = cmdToReload.toLowerCase();
          let loadedCommand = bot.commands.get(cmdToReload) || bot.commands.get(bot.aliases.get(cmdToReload));
          if (!loadedCommand) {
            console.error(`A command or alias with the name "${cmdToReload}" doesn't exist!`);
            return failedReloads.push({command: cmdToReload, reason: "command/alias does not exist"});
          }

          try {
            bot.commands.delete(loadedCommand.config.name);
            let reloadedCommand = require(`../${loadedCommand.config.category}/${loadedCommand.config.name}.js`);
            bot.commands.set(reloadedCommand.config.name, reloadedCommand);
            if (reloadedCommand.config.aliases) {
              reloadedCommand.config.aliases.forEach(alias => {
                bot.aliases.set(alias, reloadedCommand.config.name);
              });
            }
            delete require.cache[require.resolve(`../${loadedCommand.config.category}/${loadedCommand.config.name}.js`)];
            console.log(`Successfully reloaded the "${reloadedCommand.config.name}" command.`);
            successfulReloads.push(reloadedCommand.config.name);
          }
          catch (err) {
            console.error(`Couldn't reload the "${cmdToReload}" command!`, err.message);
            return failedReloads.push({command: cmdToReload, reason: err.message});
          }
      });

      let result;
      let errorMsgs = "";
      for (let f = 0; f < failedReloads.length; f++) {
        errorMsgs += `${failedReloads[f].command}: ${failedReloads[f].reason}\n`;
      }

      if (successfulReloads.length > 0 && failedReloads.length < 1) {
        result = `Successfully reloaded ${successfulReloads.length} command(s): \`${successfulReloads.join(", ")}\``;
      }
      else if (successfulReloads.length > 0 && failedReloads.length > 0) {
        result = `Successfully reloaded ${successfulReloads.length} command(s): \`${successfulReloads.join(", ")}\`\nFailed to reload ${failedReloads.length} command(s): \`\`\`${errorMsgs}\`\`\``;
      }
      else {
        result = `Failed to reload ${failedReloads.length} command(s): \`\`\`${errorMsgs}\`\`\``;
      }
      return message.channel.send(result);

    }
}
