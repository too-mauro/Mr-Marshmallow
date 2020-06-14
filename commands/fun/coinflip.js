/*
This command "flips" a coin (returns either a 1 or 2) and tells the user either
"heads" or "tails" depending on the number.
*/

module.exports = {
  config: {
      name: "coinflip",
      description: "Flip a coin!",
      usage: "",
      category: "fun",
      aliases: ["f", "flip"]
  },
  run: async (bot, message, args) => {

    let headsOrTails = Math.floor(Math.random() * (Math.floor(2) - Math.ceil(1) + 1) ) + Math.ceil(1);

    switch(headsOrTails) {
      case 1:
        return message.channel.send(":white_circle: ` Heads `");

      case 2:
        return message.channel.send(":white_circle: ` Tails `");

      default:
        // This is here in the event something wrong happens. Who knows, there's a possibility!
        console.log("Flip command had an error!");
        return message.channel.send("Looks like I got a weird coin... Please try again later!");
    }
  }
}
