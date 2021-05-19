/* Returns text with alternating uppercase and lowercase text that will look
like this: "HeLlO wOrLd!" */

const {readFileSync} = require("fs");
const {restrictedWordsFiltered} = require("../../config/bot/util.js");

module.exports = {
  config: {
      name: "mock",
      description: "MoCk SoMeOnE wItH tExT lIkE tHiS!",
      usage: "<text>",
      aliases: ["mo"],
      category: "fun"
  },
  run: async (bot, message, args) => {

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, you need to give me something to mock!`);
    }

    // check if bot has "manage messages" permissions
    if (message.guild.me.permissionsIn(message.channel).has("MANAGE_MESSAGES")) message.delete();

    // check if the string has a restricted word and stop here if at least 1 is found
    const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
    if (restrictedWordsFiltered(message, serverConfig)) return;

    let chars = args.join(" ").toLowerCase().split("");
    let regex = new RegExp(/[ \n\r\t!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/);
    let previousCharacterCapitalized = false;
    chars.forEach((character, index) => {
      if (regex.test(character)) {
        // is a space or symbol
        return;
      }
      else if (!previousCharacterCapitalized) {
        chars[index] = character.toUpperCase();
        previousCharacterCapitalized = !previousCharacterCapitalized;
      }
      else {
        previousCharacterCapitalized = !previousCharacterCapitalized;
      }
    });
    return message.channel.send(chars.join(""));
  }
}
