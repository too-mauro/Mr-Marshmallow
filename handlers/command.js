const { readdirSync } = require("fs");
const { getCategories } = require("../config/bot/categories.js");

module.exports = (bot) => {
    getCategories().forEach(dirs => {
        const commands = readdirSync(`./commands/${dirs}/`).filter(d => d.endsWith('.js'));
        for (let file of commands) {
            let pull = require(`../commands/${dirs}/${file}`);
            bot.commands.set(pull.config.name, pull);
            if (pull.config.aliases) pull.config.aliases.forEach(a => bot.aliases.set(a, pull.config.name));
        }
    });
}
