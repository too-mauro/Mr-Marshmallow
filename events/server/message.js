/* This event runs whenever a message is sent in any server the bot is in.
It checks if the message is not from a DM or bot and if the server is available.
It then gets the server's configuration data, checks for a mention or for a bot
command once the above two checks pass. If a command is found, this event runs
it. If the bot is mentioned, it gives the server's prefix to the user. If neither
occur, it runs the blacklist word filter if the server explicitly turned it on. */

const {readFileSync} = require("fs");
const {restrictedWordsFiltered} = require("../../config/bot/util.js");

module.exports = async (bot, message) => {

    /* Don't do anything if the message is in a direct message, the author is a
       bot, the server is unavailable, or the bot has no permission to send messages. */
    if (message.author.bot || !message.guild) return;
    else if (!message.guild.available || !message.guild.me.permissionsIn(message.channel).has("SEND_MESSAGES")) return;

    // Get the server's configuration file data.
    const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));

    /* Make the prefix lowercase (if applicable) which ensures a case-insensitive
       prefix. Then, get any arguments and search for a known command. If one is found, run it.
       (This has to be returned so the word filter doesn't run; if it wasn't, the filter might
       prevent the command from running properly.) */
    const cleanPrefix = message.content.substr(0, serverConfig.prefix.length).toLowerCase();
    if (cleanPrefix == serverConfig.prefix) {
      const args = message.content.slice(cleanPrefix.length).trim().split(/ +/g);
      const cmd = args.shift().toLowerCase();
      const commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
      if (commandfile) return commandfile.run(bot, message, args);
    }

    /* At this point, no command was found. If the server's restricted word filter is enabled, check for
      words in the filter by removing spaces in the message. If any are found, try to delete it
      and warn the user with the server's warning message (if the warn user option is set). */
    if (restrictedWordsFiltered(message, serverConfig)) return;

    // If a user mentions the bot outside of a command, return the server's prefix.
    const mentionRegex = new RegExp(`^(<@!?${bot.user.id}>)\\s*`);
    if (mentionRegex.test(message.content)) {
      return message.channel.send(`Forgot my prefix? **${message.guild.name}**'s prefix is: \` ${serverConfig.prefix} \``);
    }
}
