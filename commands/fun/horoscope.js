// This command gets the day's horoscope for each sign.

const fetch = require("node-fetch");
const {decode} = require("he");

module.exports = {
  config: {
      name: "horoscope",
      description: "Read the stars and find out your daily horoscope!",
      usage: "<sign name or emoji>",
      aliases: ["horo"],
      category: "fun"
  },
  run: async (bot, message, args) => {

    // get text and emoji representations of the star signs
    const signs = ["aquarius", "pisces", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn"];
    const signEmoji = ["♒", "♓", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑"];

    if (!args || args.length < 1) {
      let signString = "";
      signs.forEach((sign, index) => {
        signString += `*${sign}* (${signEmoji[index]})`;
        if (index < signs.length - 1) signString += " | ";
      });
      return message.channel.send(`Please specify a sign, **${message.author.username}**!\nValid signs: ${signString}`);
    }

    let matched = false;
    let input = args[0].toLowerCase();

    if (signs.includes(input)) matched = true;
    else if (!matched) {
      // couldn't find the sign as text arg. try parsing for emoji
      signEmoji.forEach((sign, index) => {
        if (matched) return;
        else if (sign == input) {
          input = signs[index];
          matched = true;
        }
      });
    }

    if (!matched) {
      return message.channel.send(`**${message.author.username}**, please enter a valid sign!`);
    }

    try {
      message.channel.send("Reading the stars and getting your daily horoscope...")
        .then(async msg => {
          const horoscope = await fetch(`https://ohmanda.com/api/horoscope/${input}`)
            .then(res => res.json())
            .then(json => {
              setTimeout(() => {
                msg.edit(`- __${input.slice(0, 1).toUpperCase() + input.slice(1)} Daily Horoscope for ${getFullDate()}__ -\n${decode(json.horoscope)}`);
              }, 1000);
            })
            .catch(err => {
              console.error(err);
              msg.edit("It's too hard to read out the stars right now. Try again later!");
            });
        });
    }
    catch (err) {
      console.error(err);
      return message.channel.send("It's too hard to read out the stars right now. Try again later!");
    }

  }
}

function getFullDate() {
  const date = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
