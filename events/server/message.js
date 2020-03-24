const fs = require("fs");

module.exports = async (bot, message) => {

    // don't do anything if the message is in a DM or the author's a bot
    if (message.author.bot || message.channel.type === "dm") return;

    // get the prefix from the server config file
    const prefix = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`)).prefix;

    // if the message specifically pings the bot, return the server's prefix
    //if (message.isMentioned(bot.user)) return message.channel.send(`The prefix for this server is:\n\`${prefix}\``);
    
    // makes sure prefix is case-insensitive
    let cleanPrefix = message.content.substr(0, prefix.length).toLowerCase();
    if (cleanPrefix !== prefix) return;

    // otherwise, let it get any arguments and search for a known command
    let args = message.content.slice(cleanPrefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    let commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
    if (commandfile) {  commandfile.run(bot, message, args);  }
}
