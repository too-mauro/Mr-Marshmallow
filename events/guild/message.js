const { prefix } = require("../../botsettings.json");

module.exports = async (bot, message) => {
    if(message.author.bot || message.channel.type === "dm") return;

    // makes sure message starts with prefix and is case-insensitive
    let cleanPrefix = message.content.substr(0, prefix.length).toLowerCase();
    if (cleanPrefix != prefix) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    let commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
    if(commandfile) commandfile.run(bot, message, args);
}
