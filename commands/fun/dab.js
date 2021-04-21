/*
This command returns a picture of Mr. Marshmallow dabbing without a user mention.
With one, the user can dab on another user EarthBound-style, and, with luck and a
trusty random number generator, they can output up to 1000 damage!
*/

const {getUserFromMention} = require("../../config/bot/util.js");

module.exports = {
  config: {
      name: "dab",
      description: "Get the bot to dab or dab on someone!",
      usage: "(@mention)",
      aliases: ["d"],
      category: "fun"
  },
  run: async (bot, message, args) => {

    // If there is no argument, just give the user a regular dab.
    const dabEmote = "<:marshDab:830943246032830479>";
    if (!args || args.length < 1) {
      if (message.guild.me.permissionsIn(message.channel).has("ATTACH_FILES")) {
        return message.channel.send({files: ["./config/bot/media/marshDab.png"]});
      }
      else return message.channel.send(dabEmote);
    }

    // grab member mention and ensure it's a member
    let member = getUserFromMention(args[0], message.guild);
    if (!member) {
  	   return message.channel.send(`**${message.author.username}**, you need to mention a user properly to dab on them!`);
    }
    else if (member.user == message.author) member = "themself"; // change second mention if user mentions self
    return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n• ${getRating()}`);
  }
}

function getRating() {
  let number = Math.floor(Math.random() * (Math.floor(10) - Math.ceil(1) + 1)) + Math.ceil(1);
  let rating = "";
  if (number < 3) rating = "Yikes, pretty sloppy!"; // rating of 1 or 2
  else if (number < 5) rating = "That was, er, something..."; // rating of 3 or 4
  else if (number < 7) rating = "Not bad, but I think you could use an improvement."; // rating of 5 or 6
  else if (number < 9) rating = "OK, that was pretty good. I like it!"; // rating of 7 or 8
  else rating = "Wow, very stylish!"; // rating of 9 or 10

  return rating + ` (you got a ${number}/10)`;
}
