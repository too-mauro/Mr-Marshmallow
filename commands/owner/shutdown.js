/*
This command shuts down (or restarts) the bot, and can only be executed by the
bot owner defined in the config/bot/settings.json file.
*/

const { owners } = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "shutdown",
        description: "Shuts down the bot. Restricted to the bot owner.",
        category: "owner",
        aliases: ["sd", "restart"],
        usage: ""
    },
    run: async (bot, message, args) => {

      if (!owners.includes(message.author.id)) return message.channel.send(`**${message.author.username}**, you must be the bot owner to run this command.`);

      message.channel.send("Are you *sure* you want to shut me off? (y/n)")
      .then(() => {
        message.channel.awaitMessages(response => response.author.id === message.author.id, {
          max: 1,
          time: 10000,
          errors: ['time'],
        })
        .then((collected) => {
          let res = collected.first().content.toLowerCase();
          if (res == 'yes' || res == 'y') {
            try {
              message.channel.send(`OK. ${bot.user.username} shutting down...`);
              console.log(`${bot.user.username} shutting down...`);
              setTimeout(function () { process.exit(); }, 1000); // The timeout is to allow the bot to send the message before stopping the process.
            }
            catch(e) { return message.channel.send(`Whoops, something went wrong! Here's the error: ${e.message}`); }
          }
          else if (res == 'no' || res == 'n') {
            return message.channel.send("The operation's been cancelled.");
          }
        })
        .catch(() => {
          message.channel.send("Time's up!");
        });
      });

    }
}
