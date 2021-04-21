/*
This command "flips" a coin (using Math.random()) and tells the user either
"heads" or "tails" depending on the number.
*/

module.exports = {
  config: {
      name: "coinflip",
      description: "Flip a coin!",
      usage: "",
      aliases: ["f", "flip"],
      category: "fun",
  },
  run: async (bot, message, args) => {
    return message.channel.send(`:white_circle: \` ${(Math.random() < 0.5) ? "Heads" : "Tails"} \``);
  }
}
