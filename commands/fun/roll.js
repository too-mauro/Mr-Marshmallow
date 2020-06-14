/*
This command either rolls a standard 6-sided die, two 6-sided dice, a 20-sided
die, or 100-sided die. If there is a +/- value after the "20" or "100" argument,
use that value to modify the resulting value.
*/

module.exports = {
  config: {
      name: "roll",
      description: "Roll some dice and see what you get!",
      usage: "(6) (12) (20 <optional modifier>) (100 <optional modifier>)",
      category: "fun",
      aliases: ["r"]
  },
  run: async (bot, message, args) => {

      // if there are no arguments, default to rolling a standard 6-sided die
      if (!args || args.length < 1) {
        return message.channel.send(`:game_die: \`\` ${rollDie(6)} \`\``);
      }

      // otherwise, look for number of faces
      switch(args[0]) {
        case '6':
          // this is just in case someone actually types in 'roll 6'
          return message.channel.send(`:game_die: \`\` ${rollDie(6)} \`\``);

        case '12':
          return message.channel.send(`:game_die::game_die: \`\` ${rollDie(6) + rollDie(6)} \`\``);

        case '20':
          let d20 = dRoll(20, args.slice(1).join(""));
          return message.channel.send(`<:d20:683756486631227422> \`\` ${d20[0]} \`\` (${d20[1]} modifier)`);

        case '100':
          let d100 = dRoll(100, args.slice(1).join(""));
          return message.channel.send(`<:d20:683756486631227422> \`\` ${d100[0]} \`\` (${d100[1]} modifier)`);

        default:
          return message.channel.send(`**${message.author.username}**, please enter a number!\n(Valid options: \`6\`, \`12\`, \`20\`, \`100\`)`);
      }
  }
}

function rollDie(numFaces) {
  return Math.floor(Math.random() * (Math.floor(numFaces) - Math.ceil(1) + 1) ) + Math.ceil(1);
}

function dRoll(numFaces, modifier) {
  // if there's no modifier, return the roll's value
  // otherwise, remove the extra space from the modifier if any
  let rollValue = rollDie(numFaces);
  if (!modifier) return [rollValue, "no"];
  var modValue = modifier.split().join("").slice(1);

  /* check if the first character is either a '+' or '-', and if the stuff after that is a number.
  otherwise, treat it as an invalid modifier and return just the roll's value.
  if the value is a number and the result exceeds the number of faces or goes below 1, return the maximum or minimum value */
  if (isNaN(modifier) || isNaN(modValue)) return [rollValue, "invalid"];
  modValue = Math.trunc(modValue);
  switch (modifier.charAt(0)) {
    case '+':
      if (parseInt(rollValue) + parseInt(modValue) > numFaces) return [numFaces, modifier];
      else return [parseInt(rollValue) + parseInt(modValue), modifier];

    case '-':
      if (parseInt(rollValue) - parseInt(modValue) < 1) return [1, modifier];
      else return [parseInt(rollValue) - parseInt(modValue), modifier];

    default:
      modifier = Math.trunc(modifier);
      if (parseInt(rollValue) + parseInt(modValue) > numFaces) return [numFaces, modifier];
      else return [parseInt(rollValue) + parseInt(modValue), `+${modifier}`];
  }
}
