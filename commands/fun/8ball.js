/*
This command reads from a pre-made response file and randomly picks a response
from it, then responds to the question the user "asks" with it.
*/

const fs = require("fs");

module.exports = {
  config: {
      name: "8ball",
      description: "Ask the 8-ball a question!",
      usage: ["<question>"],
      category: "fun",
      aliases: ["8", "ball"]
  },
  run: async (bot, message, args) => {

      if (!args || args.length < 2) {
        return message.channel.send(`**${message.author.username}**, please ask the 8-ball a full question!`);
      }

      fs.readFile('./config/bot/8ballresponse.json', 'utf8', (err, data) => {
        if (err) {
          console.log(err);
          return message.channel.send("Sorry, looks like the 8-ball is on the fritz right now! Please try again later.");
        }
        else {
          var file = JSON.parse(data);
          let response = file.ball[(Math.floor(Math.random() * (Math.floor(file.ball.length) - Math.ceil(1) + 1) ) + Math.ceil(1)) - 1].response;

          return message.channel.send(`<:marshThink:696133701142315068>  You asked: "*${args.join(" ")}*"\n:8ball:  8-Ball's Response: "**${response}**"`);
        }
      });

  }
}
