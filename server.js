/* This is Mr. Marshmallow's main server file. All other files used for
commands and events run as if they are included in this file.

This file initializes a Discord.js Client and grabs the bot token  that's
stored in the .env file. It then passes the bot client to the ready event,
where it can then be usable on Discord. Create a new Map object here so it's
usable for server music queues. */
"use strict";
const {Client, Collection} = require("discord.js");
const {readdirSync, statSync} = require("fs");

try {
  const result = require("dotenv").config();
  if (result.error) throw result.error;

  /* Initialize the bot and load all the commands (and respective aliases) and the needed data
  structures for the music commands and the trivia and battle games into memory. */
  const bot = new Client();
  ["aliases", "commands"].forEach(x => bot[x] = new Collection());
  ["musicQueues", "triviaLobbies","battleGames"].forEach(x => bot[x] = new Map());

  // Get the handlers and load their contents.
  readdirSync("./handlers/").forEach(file => {
    if (!statSync(`./handlers/${file}`).isDirectory()) {
      require(`./handlers/${file}`)(bot);
    }
  });

  /* Ensure any uncaught errors are printed in the console. This prevents the
  server from unintentionally quitting. */
  process.on("unhandledRejection", error => {
    console.error("Uncaught Promise Rejection", error);
  });

  // Logs the bot into the Discord platform using the bot token in the .env file.
  bot.login(process.env.TOKEN);
}
catch (err) {
  console.error("Failed to initialize the bot server!\n", err);
  if (bot) bot.destroy();
  process.exit(1);
}
