// This is the main index file of Mr. Marshmallow. All of the other files used
// for the bot commands and events use this file as a base.

// Gets the Client from Discord.js and the bot token stored in the config/bot
// directory.
const { Client, Collection } = require("discord.js");
const { token } = require("./config/bot/settings.json");
const bot = new Client();

// Loads all of the commands and their respective aliases into memory.
["aliases", "commands"].forEach(x => bot[x] = new Collection());
["console", "command", "event"].forEach(x => require(`./handlers/${x}`)(bot));

// Logs the bot into the Discord platform and sends a message to
// the console saying it logged in.
bot.login(token);
console.log("Bot user successfully connected to Discord!");
