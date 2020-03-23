/*
This command allows users to send suggestions or errors to the bot developer.
*/

const { ticketChannel } = require('../../config/bot/settings.json');

module.exports = {
  config: {
      name: "ticket",
      description: "Got something you want to report? Shoot a ticket with this command!",
      usage: "<message>",
      aliases: ["t", "feedback", "fb"],
      category: "miscellaneous"
  },
  run: async (bot, message, args) => {

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, you need to provide a message if you want to send a ticket! (You can also submit one file if it helps describe an issue or suggestion.)`);
    }

    // grabs the message, checks if the feedback channel exists, sends the message if it does, and tells the user it was a success
    let text = args.join(" ");
    let tChannel = bot.channels.cache.get(ticketChannel);
    if (!tChannel.deleted) {
      if (message.attachments.first()) {
        tChannel.send(`---\n**${message.author.tag}**:\n` + text, {files: [message.attachments.first().url]});
      }
      else {
        tChannel.send(`---\n**${message.author.tag}**:\n` + text);
      }
      message.reply("your ticket request has been sent and will be received shortly. Thanks!").catch(console.error);
    }
    else {
      return message.channel.send("Whoops! We couldn't send your request...!");
    }

  }
}
