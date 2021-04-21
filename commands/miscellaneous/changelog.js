/* This command returns a link to the official GitHub repository's change log
file so users can check out what changed with the latest Mr. Marshmallow update. */

const {readFileSync} = require("fs");
const {version} = JSON.parse(readFileSync("./package.json", "utf8"));
const {removeEndingZeroes} = require("../../config/bot/util.js");

module.exports = {
  config: {
    name: "changelog",
    description: "Check out Mr. Marshmallow's change log on GitHub!",
    usage: "",
    aliases: ["cl"],
    category: "miscellaneous",
  },
  run: async (bot, message, args) => {
    return message.channel.send(`Current version: **v${removeEndingZeroes(version)}**\nCheck out the change log here:   <https://git.io/JT7Sh>`);
  }
}
