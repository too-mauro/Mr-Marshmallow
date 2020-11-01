// This command responds with a random joke.

const fetch = require("node-fetch");

module.exports = {
  config: {
      name: "joke",
      description: "I'll tell you a joke, why not?",
      usage: "",
      category: "fun",
      aliases: ["j", "pun"]
  },
  run: async (bot, message, args) => {
    try {
      const response = await fetch("https://official-joke-api.appspot.com/jokes/random");
      const json = await response.json();
      message.channel.send(json.setup).then(msg => {
        setTimeout(function () {
          msg.edit(`${json.setup}\n${json.punchline}`);
        }, 2000);
      });
    }
    catch (err) {
      console.log(err);
      return message.channel.send("I can't think of something funny right now. Try again later!");
    }

  }
}
