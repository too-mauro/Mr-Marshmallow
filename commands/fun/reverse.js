/*
This command simply deletes the author's original message (if it has the
permission) and reverses it. For the message to be deleted, the bot needs the
`Manage Messages` permission. This also checks for any blacklisted words; if at
least one is found, it will stop before anything is reversed and will warn the
user if the option is enabled.
*/

const fs = require("fs");

module.exports = {
  config: {
      name: "reverse",
      description: "Reverses whatever you say.",
      aliases: ["re", "yas"],
      usage: "<text>",
      category: "fun"
  },
  run: async (bot, message, args) => {

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, you need to give me a message to reverse!`);
    }

    // get everything after the message, join it as one combined string, then reverse it
    let text = args.join(" ").split("").reverse().join("");

    // check if bot has "manage messages" permissions
    if (message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")) { message.delete(); }

    // check if the string has a blacklisted word and stop here if at least 1 is found
    const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
    if (serverConfig.wordfilter.enabled) {
      let serverBlacklist = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/blacklist.json`, 'utf8'));
      const blocked = serverBlacklist.wordfilter.filter(w => message.content.toLowerCase().match(new RegExp(w, 'g')));
      if (blocked.length > 0) {
        if (serverConfig.wordfilter.warnings.enabled) {
          message.channel.send(serverConfig.wordfilter.warnings.message.replace(/username/g, message.author));
        }
        return;
      }
    }

    return message.channel.send(text);
  }
}
