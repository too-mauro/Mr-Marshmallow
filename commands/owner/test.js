/*
This command just tests whatever the bot developer needs to test, and can only
be executed by the bot owner defined in the config/bot/settings.json file.
*/

const { ownerID } = require('../../config/bot/settings.json');

module.exports = {
    config: {
        name: "test",
        usage: [],
        category: "owner",
        description: "Placeholder command for testing new features. Restricted to the bot owner."
    },
    run: async (bot, message, args) => {

        if (message.author.id != ownerID) return;

        // run the rest of the command here

    }
  }
