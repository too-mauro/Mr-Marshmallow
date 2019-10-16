module.exports = (bot) => {
let prompt = process.openStdin();
prompt.addListener("data", res => {
    let x = res.toString().trim().split(/ +/g);
        bot.channels.get("(channel ID here)").send(x.join(" "));
    });
}
