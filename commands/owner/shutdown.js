/* This command shuts down (or restarts) the bot, and can only be executed by
the bot owner(s) defined in the config/bot/settings.json file. */

const {owners} = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "shutdown",
        description: "Shuts down the bot. Restricted to the bot owner.",
        usage: "",
        aliases: ["sd", "restart"],
        category: "owner"
    },
    run: async (bot, message, args) => {

      if (!owners.includes(message.author.id)) {
        return message.channel.send(`**${message.author.username}**, you must be the bot owner to run this command.`);
      }

      message.channel.send("Are you *sure* you want to shut me off? (y/n)")
      .then(() => {
        let allowedActions = ["yes", "y", "no", "n"];
        message.channel.awaitMessages(response => response.author.id == message.author.id && allowedActions.includes(response.content), { max: 1, time: 10000, errors: ["time"] })
        .then((collected) => {
          let res = collected.first().content.toLowerCase();
          if (res == "yes" || res == "y") {
            try {
              message.channel.send(`OK. ${bot.user.username} shutting down...`);
              console.log(`${bot.user.username} shutting down...`);
              setTimeout(() => {
                bot.destroy();
                process.exit();
              }, 1000);
              // The timeout is to allow the bot to send the message before stopping the process.
            }
            catch (err) {
              console.error(err);
              return message.channel.send(`Something happened while trying to shut down:\n\`\`\`${err.message}\`\`\``);
            }
          }
          else if (res == "no" || res == "n") {
            return message.channel.send("The operation has been cancelled.");
          }
        })
        .catch(() => {
          message.channel.send("Time's up! The operation has been cancelled.");
        });
      });
    }
}
