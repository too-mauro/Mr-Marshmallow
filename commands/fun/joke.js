// This command responds with a random joke.

const fetch = require("node-fetch");

module.exports = {
  config: {
      name: "joke",
      description: "I'll tell you a joke, why not?",
      usage: "",
      aliases: ["j", "pun"],
      category: "fun"
  },
  run: async (bot, message, args) => {
    try {
      const joke = await fetch("https://official-joke-api.appspot.com/jokes/random").then(res => res.json());
      message.channel.send(joke.setup)
        .then(msg => {
          setTimeout(() => {
            msg.edit(`${joke.setup}\n${joke.punchline}`);
          }, 2000);
        });
    }
    catch (err) {
      console.error(err);
      return message.channel.send("I can't think of something funny right now. Try again later!");
    }

  }
}
