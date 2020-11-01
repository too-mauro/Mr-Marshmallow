/*
This command responds with a randomly-picked response from the 8ball.json
file in the config/bot directory.
*/

const fs = require("fs");

module.exports = {
  config: {
      name: "8ball",
      description: "Ask the 8-ball a question!",
      usage: "<question>",
      category: "fun",
      aliases: ["8", "ball"]
  },
  run: async (bot, message, args) => {
      if (!args || args.length < 2) {
        return message.channel.send(`**${message.author.username}**, please ask the 8-ball a full question!`);
      }
      let question = args.join(" ");
      message.channel.send(`<:marshThink:696133701142315068>  "${question}"\n:8ball:  *(shake) (shake) (shake)*`).then(msg => {
        fs.readFile("./config/bot/8ball.json", 'utf8', (err, data) => {
          if (err) {
            console.log(err);
            return msg.channel.send("Sorry, looks like the 8-ball is on the fritz right now! Please try again later.");
          }
          let responses = JSON.parse(data).responses;
          let answer = responses[(Math.floor(Math.random() * (Math.floor(responses.length) - Math.ceil(1) + 1) ) + Math.ceil(1)) - 1];
          setTimeout(function () {
            msg.edit(`<:marshThink:696133701142315068>  "${question}"\n:8ball:  **${answer}**`);
          }, 1000);
        });
      });
  }
}
