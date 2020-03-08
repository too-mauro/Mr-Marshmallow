module.exports = {
  config: {
      name: "roll",
      description: "Roll some die and see what you get!",
      usage: "<number of faces>",
      category: "fun",
      aliases: ["r"]
  },
  run: async (bot, message, args) => {

      // if there are no arguments, default to rolling a standard 6-sided die
      if (!args || args.length < 1) {
        return message.channel.send(`:game_die: \`\` ${rollSingleDie(6)} \`\``);
      }

      // otherwise, look for number of faces
      switch(args[0]) {
        case '6':
          // this is just in case someone actually types in 'roll 6'
          return message.channel.send(`:game_die: \`\` ${rollSingleDie(6)} \`\``);

        case '12':
          return message.channel.send(`:game_die::game_die: \`\` ${rollDoubleDie()} \`\``);

        case '20':
          var d20 = rollD20(rollSingleDie(20), args.slice(1).join(""));
          return message.channel.send(`<:d20:683756486631227422> \`\` ${d20[0]} \`\` (${d20[1]} modifier)`);

        default:
          return message.channel.send(`**${message.author.username}**, please enter a number!\n(Valid options: \`6\`, \`12\`, \`20\`)`);
      }
  }
}

function rollSingleDie(num) {
  return Math.floor(Math.random() * (Math.floor(num) - Math.ceil(1) + 1) ) + Math.ceil(1);
}

function rollDoubleDie() {
  return rollSingleDie(6) + rollSingleDie(6);
}

function rollD20(rollValue, modifier) {
  // if there's no modifier, return the roll's value
  // otherwise, remove the extra space from the modifier if any
  if (modifier == "") return [rollValue, "no"];
  modifier = modifier.split().join("");
  var modValue = modifier.slice(1, modifier.length);

  // check if the first character is either a '+' or '-', and if the stuff after that is a number
  // otherwise, treat it as an invalid modifier and return just the roll's value
  // if the value is a number and the result exceeds 20 or goes below 1, return the maximum or minimum value (20 or 1)
  if (modifier.charAt(0) == "+" && !isNaN(modValue)) {
    if (parseInt(rollValue) + parseInt(modValue) > 20) return [20, modifier];
    else return [parseInt(rollValue) + parseInt(modValue), modifier];
  }
  else if (modifier.charAt(0) == "-" && !isNaN(modValue)) {
    if (parseInt(rollValue) - parseInt(modValue) < 1) return [1, modifier];
    else return [parseInt(rollValue) - parseInt(modValue), modifier];
  }
  else return [rollValue, "invalid"];
}
