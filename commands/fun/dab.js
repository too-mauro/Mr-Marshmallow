module.exports = {
  config: {
      name: "dab",
      description: "Get the bot to dab or dab on someone!",
      usage: "(@mention)",
      category: "fun",
      aliases: ["d"]
  },
  run: async (bot, message, args) => {

    // give user a regular dab when no argument
    if (!args || args.length < 1) {
      return message.channel.send("**Note:** If you want to dab on someone, just mention them!", {files: ['./config/bot/media/marshDab.png']});
    }

    // grab member mention and ensure it's a member
    let member = message.mentions.members.first();
    if (!message.mentions.users.size) {
  	   return message.channel.send(`**${message.author.username}**, you need to mention a user in order to dab on them!`);
    }
    if (member == message.guild.member(message.author)) { member = "themself"; }

    // initialize damage counter and set dab emoji
    var attackDamage = Math.floor(Math.random() * (Math.floor(1000) - Math.ceil(1) + 1) ) + Math.ceil(1);
    var dabEmote = "<:marshDab:648374543005777950>";

    if (attackDamage === 1) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
       "•  . . .\n" + `• **${attackDamage} HP** of damage.`);
    }
    else if (attackDamage <= 50) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
        `• **${attackDamage} HP** of damage! \n` + "• (Wasn\'t very effective...)");
    }
    else if (attackDamage <= 100) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
        `• **${attackDamage} HP** of damage!`);
    }
    else if (attackDamage <= 450) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
        "• Oh, baby! \n" + `• **${attackDamage} HP** of damage!`);
    }
    else if (attackDamage <= 750) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
        "• *WOWZA!* \n" + `• **${attackDamage} HP** of damage!`);
    }
    else {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
        "• ***SMAAAASH!!*** \n" + `• A whoppin' **${attackDamage} HP** of mortal damage!`);
    }
  }
}
