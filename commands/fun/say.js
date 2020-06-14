/*
This command simply deletes the author's original message (if it has the
permission) and repeats it. For the message to be deleted, the bot needs the
`Manage Messages` permission.  This also checks for any blacklisted words; if at
least one is found, it will stop before anything is repeated and will warn the
user if the option is enabled.
*/

const fs = require("fs");

module.exports = {
  config: {
      name: "say",
      description: "Repeats whatever you say.",
      aliases: ["s", "parrot"],
      usage: "<text>",
      category: "fun"
  },
  run: async (bot, message, args) => {

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, you need to give me a message to say!`);
    }

    // get everything after the message, join it as one combined string, then reverse it
    let text = args.join(" ");

    // check if bot has "manage messages" permissions
    if (message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")) { message.delete(); }

    // check if the string has a blacklisted word and stop here if at least 1 is found
    const configFile = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
    if (configFile.wordfilter.enabled) {
      let configBlackList = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/blacklist.json`, 'utf8'));
      const blocked = configBlackList.wordfilter.filter(w => message.content.toLowerCase().match(new RegExp(w, 'g')));
      if (blocked.length > 0) {
        if (configFile.wordfilter.warnings.enabled) {
          let warningMessage = configFile.wordfilter.warnings.message.replace(/username/g, message.author);
          message.channel.send(warningMessage);
        }
        return;
      }
    }

    return message.channel.send(text);
  }
}
