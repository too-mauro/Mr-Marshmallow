/*
This command allows users to send suggestions or errors to the bot developer.
*/

const fs = require("fs");
const botTicketChannel = JSON.parse(fs.readFileSync("./config/bot/settings.json", "utf8")).channels.ticket;

module.exports = {
  config: {
      name: "ticket",
      description: "Got something you want to report? Shoot a ticket with this command!",
      usage: "<message>",
      aliases: ["tick", "feedback", "fb"],
      category: "miscellaneous"
  },
  run: async (bot, message, args) => {

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, you need to provide a message if you want to send a ticket! (You can also submit one file if it helps describe an issue or suggestion.)`);
    }

    // grabs the message, checks if the feedback channel exists, sends the message if it does, and tells the user it was a success
    let text = args.join(" ");
    let tChannel = bot.channels.cache.get(botTicketChannel);
    if (!tChannel) {
      return message.channel.send("Whoops! We couldn't send your request...!");
    }

    if (message.attachments.first()) {
      tChannel.send(`---\n**${message.author.tag}**:\n` + text, {files: [message.attachments.first().url]});
    }
    else {
      tChannel.send(`---\n**${message.author.tag}**:\n` + text);
    }
    return message.reply("your ticket request has been sent and will be received shortly. Thanks!").catch(console.error);
  }
}
