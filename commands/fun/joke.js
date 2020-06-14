/*
This command responds with a random joke.
*/

const fetch = require("node-fetch");
const jokeAPI = "https://official-joke-api.appspot.com/jokes/random";

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
      let response = await fetch(jokeAPI);
      let json = await response.json();
      message.channel.send(json.setup).then(msg => {
        setTimeout(function () {
          msg.edit(`${json.setup}\n${json.punchline}`);
        }, 2000);
      });
    }
    catch (e) {
      console.log(e);
      return message.channel.send("I can't really think of something funny right now. Try again later!");
    }

  }
}
