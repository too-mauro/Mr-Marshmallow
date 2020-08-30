/*
This command evaluates both JavaScript and Discord.js code, and can only be
executed by the bot owner defined in the config/bot/settings.json file.
*/

const { owners } = require("../../config/bot/settings.json");
const { inspect } = require("util");
const fs = require("fs");


module.exports = {
    config: {
        name: "evaluate",
        description: "Evaluates JavaScript and Discord.js code. Restricted to the bot owner.",
        usage: "<input>",
        category: "owner",
        aliases: ["eval", "js"]
    },
    run: async (bot, message, args) => {

        if (!owners.includes(message.author.id)) return message.channel.send(`**${message.author.username}**, you must be the bot owner to run this command.`);

        if (!args || args.length < 1) {
          return message.channel.send(`**${message.author.username}**, please enter some code to evaluate!`);
        }

        let toEval = args.join(" ");
        try {
        	let evaluated = inspect(eval(toEval, { depth: 0 }));

          let hrStart = process.hrtime();
          let hrDiff = process.hrtime(hrStart);
          if (evaluated.length <= 1950) {
            return message.channel.send(`🕑 **${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${(hrDiff[1] / 1000000).toFixed(3)}ms**\n\`\`\`javascript\n${evaluated}\n\`\`\``);
          }
          else {
            fs.writeFile("./config/bot/eval.txt", evaluated, 'utf8', (err) => {
              if (err) {
                console.log(err);
                return message.channel.send(`Sorry **${message.author.username}**, I couldn't write the evaluated code to file!`);
              }
              console.log(evaluated);
              return message.channel.send(`🕑 **${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${(hrDiff[1] / 1000000).toFixed(3)}ms**\nThe evaluated code is longer than Discord's message limit, but the result is in the console's logs. In case you can't access that now, I made a text file containing the same data.`, { files: ["./config/bot/eval.txt"] } );
            });
          }
        }
        catch (e) {
          return message.channel.send(`Error while evaluating: \`${e.message}\``);
        }

    }
}
