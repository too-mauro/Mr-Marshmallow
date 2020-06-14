/*
This command shuts down (or restarts) the bot, and can only be executed by the
bot owner defined in the config/bot/settings.json file.
*/

const { ownerID } = require("../../config/bot/settings.json");

module.exports = {
    config: {
        name: "shutdown",
        description: "Shuts down the bot. Restricted to the bot owner.",
        category: "owner",
        aliases: ["sd", "restart"],
        usage: ""
    },
    run: async (bot, message, args) => {

      if (message.author.id != ownerID) return message.channel.send(`**${message.author.username}**, you must be the bot owner to run this command.`);

      message.channel.send("Are you *sure* you want to shut me off? (y/n)")
      .then(() => {
        message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y' || response.content === 'no' || response.content === 'n', {
          max: 1,
          time: 10000,
          errors: ['time'],
        })
        .then((collected) => {
          if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
            try {
                message.channel.send(`Looks like it's bedtime... good night.\n(${bot.user.username} shutting down...)`);
                setTimeout(function () {
                  process.exit();
                }, 1000);
            }
            catch(e) { return message.channel.send(`Whoops, something went wrong! Here's the error: ${e.message}`); }
          }
          if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
            return message.channel.send("The operation's been cancelled.");
          }
          })
          .catch(() => {
            message.channel.send("Time's up!");
          });
      });

    }
}
