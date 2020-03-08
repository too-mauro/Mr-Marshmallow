const { ownerID } = require("../../config/bot/settings.json");
const { inspect } = require("util");

module.exports = {
    config: {
        name: "eval",
        description: "Evaluates JavaScript and Discord.js code.",
        usage: "<input>",
        category: "owner (secret)",
        aliases: ["js"]
    },
    run: async (bot, message, args) => {

        if (message.author.id != ownerID) {
          return message.channel.send("You have to be the bot owner to use this command!");
        }

        try {
          let toEval = args.join(" ");
        	let evaluated = inspect(eval(toEval, { depth: 0 }));

          if (!toEval) {
            return message.channel.send(`Error while evaluating.`);
          }
          else {
            let hrStart = process.hrtime();
            let hrDiff;
            hrDiff = process.hrtime(hrStart);
            return message.channel.send(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*\n\`\`\`javascript\n${evaluated}\n\`\`\``, { maxLength: 1900 });
          }
        }
        catch (e) {
          return message.channel.send(`Error while evaluating: \`${e.message}\``);
        }

    }
}
