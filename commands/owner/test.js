const { ownerID } = require('../../config/bot/settings.json');
const fs = require("fs");

module.exports = {
    config: {
        name: "test",
        usage: "",
        category: "owner (secret)",
        description: "Just a placeholder command for testing new features."
    },
    run: async (bot, message, args) => {

        if (message.author.id != ownerID) {
          return message.channel.send("You have to be the bot owner to run this command!");
        }

        // run the rest of the command here
    }
  }
