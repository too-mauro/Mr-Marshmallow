/*
This command simply deletes the author's original message (if it has the
permission) and reverses it. For the message to be deleted, the bot needs the
`Manage Messages` permission. This also checks for any restricted words; if at
least one is found, it will stop before anything is reversed and will warn the
user if the option is enabled.
*/

const {readFileSync} = require("fs");
const {restrictedWordsFiltered} = require("../../config/bot/util.js");

module.exports = {
  config: {
      name: "reverse",
      description: "Reverses whatever you say.",
      usage: "<text>",
      aliases: ["re", "yas"],
      category: "fun"
  },
  run: async (bot, message, args) => {

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, you need to give me a message to reverse!`);
    }

    // check if bot has "manage messages" permissions
    if (message.guild.me.permissionsIn(message.channel).has("MANAGE_MESSAGES")) message.delete();
    const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
    if (restrictedWordsFiltered(message, serverConfig)) return;

    // get everything after the message, join it as one combined string, then reverse it
    return message.channel.send(args.join(" ").split("").reverse().join(""));
  }
}
