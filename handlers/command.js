/*
This file loads all the commands found in the /commands directory into memory.
There are multiple category sub-directories, so it goes through each one and
adds all the command files within said directories into memory.
*/

const { readdirSync } = require("fs");
const { getCategories } = require("../config/bot/util.js");

module.exports = (bot) => {
    getCategories().forEach(dirs => {
        const commands = readdirSync(`./commands/${dirs}/`).filter(d => d.endsWith('.js'));
        for (let file of commands) {
            let pull = require(`../commands/${dirs}/${file}`);
            bot.commands.set(pull.config.name, pull);
            if (pull.config.aliases) {
              pull.config.aliases.forEach(a => {
                bot.aliases.set(a, pull.config.name);
              });
            }
            delete require.cache[require.resolve(`../commands/${dirs}/${file}`)];
        }
    });
}
