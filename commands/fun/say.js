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
    if (message.guild.me.hasPermission("MANAGE_MESSAGES")) { message.delete(); }

    // check if the string has a blacklisted word and stop here if at least 1 is found
    const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));
    if (serverConfig.wordfilter.enabled) {
      let serverDenyList = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/denylist.json`, 'utf8'));
      const blocked = serverDenyList.wordfilter.filter(word => message.content.toLowerCase().includes(word));
      if (blocked.length > 0) {
        if (serverConfig.wordfilter.warnings.enabled) {
          if (serverConfig.wordfilter.warnings.warnType == "channel") {
            return message.channel.send(serverConfig.wordfilter.warnings.message.replace(/username/g, message.author));
          }
          else if (serverConfig.wordfilter.warnings.warnType == "dm") {
            message.author.send(serverConfig.wordfilter.warnings.message.replace(/username/g, message.author));
            return message.channel.send(`${message.author} has been warned for using a restricted word!`);
          }
        }
      }
    }

    return message.channel.send(text);
  }
}
