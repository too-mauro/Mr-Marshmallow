/*
This command evaluates both JavaScript and Discord.js code, and can only be
executed by the bot owner defined in the config/bot/settings.json file.
*/

const { ownerID } = require("../../config/bot/settings.json");
const { inspect } = require("util");

module.exports = {
    config: {
        name: "evaluate",
        description: "Evaluates JavaScript and Discord.js code. Restricted to the bot owner.",
        usage: "<input>",
        category: "owner",
        aliases: ["eval", "js"]
    },
    run: async (bot, message, args) => {

        if (message.author.id != ownerID) return;

        if (!args || args.length < 1) {
          return message.channel.send(`**${message.author.username}**, please enter some code to evaluate!`);
        }

        let toEval = args.join(" ");
        try {
        	let evaluated = inspect(eval(toEval, { depth: 0 }));

          let hrStart = process.hrtime();
          let hrDiff = process.hrtime(hrStart);
          if (evaluated.length < 2000) {
            return message.channel.send(`\`\`\`javascript\n${evaluated}\n\`\`\`*(Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${(hrDiff[1] / 1000000).toFixed(3)}ms.)*`, { maxLength: 2000 });
          }
          else {
            console.log(evaluated);
            return message.channel.send("The evaluated code is longer than 2000 characters!\n(I can't show it here, but the result is in the logs.)");
          }
        }
        catch (e) {
          return message.channel.send(`Error while evaluating: \`${e.message}\``);
        }

    }
}
