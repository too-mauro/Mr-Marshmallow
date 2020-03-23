/*
This command just tests whatever the bot developer needs to test, and can only
be executed by the bot owner defined in the config/bot/settings.json file.
*/

const { ownerID } = require('../../config/bot/settings.json');
const fs = require("fs");

module.exports = {
    config: {
        name: "test",
        usage: "",
        category: "owner",
        description: "Just a placeholder command for testing new features."
    },
    run: async (bot, message, args) => {

        if (message.author.id != ownerID) return message.channel.send("You need to be the bot owner to run this command!");

        // run the rest of the command here
        
    }
  }
