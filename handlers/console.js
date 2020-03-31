const { logChannel } = require("../config/bot/settings.json");

module.exports = (bot) => {
let prompt = process.openStdin();
prompt.addListener("data", res => {
    let x = res.toString().trim().split(/ +/g);
        bot.channels.cache.get(logChannel).send(x.join(" "));
    });
}
