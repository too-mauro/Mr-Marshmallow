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
      aliases: ["r"],
      category: "fun"
  },
  run: async (bot, message, args) => {
      // if there are no arguments, default to rolling a standard 6-sided die
      if (!args || args.length < 1) {
        return message.channel.send(`**${message.author.username}** got: \`\` ${rollDie()} \`\` :game_die:`);
      }

      // otherwise, look for number of faces
      let rollResult = "";
      const d20Emote = "<:d20_die:820416321300856872>";
      switch (args[0]) {
        case "6":
          rollResult = `\`\` ${rollDie()} \`\` :game_die:`;
          break;
        case "12":
          rollResult = `\`\` ${rollDie() + rollDie()} \`\` :game_die::game_die:`;
          break;
        case "20":
          let d20 = dRoll(20, args.slice(1).join(""));
          rollResult = `\`\` ${d20[0]} \`\` (${d20[1]} modifier) ${d20Emote}`;
          break;
        case "100":
          let d100 = dRoll(100, args.slice(1).join(""));
          rollResult = `\`\` ${d100[0]} \`\` (${d100[1]} modifier) ${d20Emote}`;
          break;
        default:
          return message.channel.send(`**${message.author.username}**, please enter a number!\n(Valid options: \`6\`, \`12\`, \`20\`, \`100\`)`);
      }
      return message.channel.send(`**${message.author.username}** got: ${rollResult}`);
  }
}

function rollDie(numFaces = 6) {
  return Math.floor(Math.random() * (Math.floor(numFaces) - Math.ceil(1) + 1)) + Math.ceil(1);
}

function dRoll(numFaces, modifier) {
  // if there's no modifier, return the roll's value
  // otherwise, remove the extra space from the modifier if any
  let rollValue = rollDie(numFaces);
  if (!modifier) return [rollValue, "no"];
  let modValue = modifier.replace(/ +/g, "");

  /* check if the first character is either a "+" or "-", and if the stuff after that is a number.
  otherwise, treat it as an invalid modifier and return just the roll's value.
  if the value is a number and the result exceeds the number of faces or goes below 1, return the maximum or minimum value */
  if (isNaN(modifier) || isNaN(modValue)) return [rollValue, "invalid"];
  modValue = Math.trunc(modValue);
  switch (modifier.charAt(0)) {
    case "+":
      if (parseInt(rollValue) + parseInt(modValue) > numFaces) return [numFaces, modifier];
      return [parseInt(rollValue) + parseInt(modValue), modifier];

    case "-":
      if (parseInt(rollValue) - parseInt(modValue) < 1) return [1, modifier];
      return [parseInt(rollValue) - parseInt(modValue), modifier];

    default:
      modifier = Math.trunc(modifier);
      if (parseInt(rollValue) + parseInt(modValue) > numFaces) return [numFaces, modifier];
      return [parseInt(rollValue) + parseInt(modValue), `+${modifier}`];
  }
}
