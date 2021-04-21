/*
This command is supposed to start a game where users can repeat the same thing
as many times as possible in one minute.
*/

const {readFileSync} = require("fs");
const {restrictedWordsFiltered} = require("../../config/bot/util.js");
const {MessageEmbed} = require("discord.js");
const {blue_dark} = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "chain",
        description: "See how many times you and your friends can keep typing a word or phrase in this repeat game!",
        usage: "(word/phrase to repeat)",
        aliases: ["ch"],
        category: "games"
    },
    run: async (bot, message, args) => {

        const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
        if (!args || args.length < 1) {
          const embed = new MessageEmbed()
            .setColor(blue_dark)
            .setTitle("A fun Chain game!")
            .addField("**Rules**", "See how many times you can repeat a word or phrase in one minute! Be careful, if you type something else, it's game over! Anyone can join in on this game.")
            .addField("**Starting the Game**", `Start with \` ${serverConfig.prefix}chain <word/phrase> \`!`)
            .setFooter(bot.user.username, bot.user.displayAvatarURL());
          return message.channel.send({embed});
        }

        // check if the string has a restricted word and stop here if at least 1 is found
        if (restrictedWordsFiltered(message, serverConfig)) return;

        let thingToRepeat = args.join(" ").replace(/ +/g, " ").replace(/\n+/g, "\n");
        let uniqueUsers = [];
        let timesRepeated = 0;
        let premature = false;
        message.channel.send(`Ready? The thing to repeat is: ${thingToRepeat}\nGO!`);
        const collector = message.channel.createMessageCollector(msg => !msg.author.bot, { time: 60000 });
        collector.on("collect", msg => {
          if (msg.content.replace(/ +/g, " ") == thingToRepeat) {
            timesRepeated++;
            if (!uniqueUsers.includes(msg.author.id)) uniqueUsers.push(msg.author.id);
          }
          else {
            premature = true;
            collector.stop();
          }
        });

        collector.on("end", collected => {
          let endMessage = (premature) ? `${collected.last().author} broke the chain!` : "**- TIME'S UP! -**";
          return message.channel.send(`${endMessage}\nThe word/phrase was repeated ${timesRepeated} time(s) by ${uniqueUsers.length} server member(s).`);
        });
    }
}
