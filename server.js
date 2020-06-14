/* This is Mr. Marshmallow's main server file. All other files used for
commands and events run as if they are included in this file.

This file initializes a Discord.js Client and grabs the bot token  that's
stored in the .env file. It then passes the bot client to the ready event,
where it can then be usable on Discord. */
'use strict';
require("dotenv").config();
const { Client, Collection } = require("discord.js");
const bot = new Client();

/* Loads all of the commands, their respective aliases, and all of the events
into memory. */
["aliases", "commands"].forEach(x => bot[x] = new Collection());
["command", "event"].forEach(x => require(`./handlers/${x}`)(bot));

/* Logs the bot into the Discord platform using the bot token in the .env file
and sends a message to the console saying it logged in. */
bot.login(process.env.TOKEN);
console.log("Bot user successfully logged in to Discord!");
