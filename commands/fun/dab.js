/*
This command returns a picture of Mr. Marshmallow dabbing without a user mention.
With one, the user can dab on another user EarthBound-style, and, with luck and a
trusty random number generator, they can output up to 1000 damage!
*/

module.exports = {
  config: {
      name: "dab",
      description: "Get the bot to dab or dab on someone!",
      usage: ["(@mention)"],
      category: "fun",
      aliases: ["d"]
  },
  run: async (bot, message, args) => {

    // If there is no argument, just give the user a regular dab.
    if (!args || args.length < 1) {
      return message.channel.send({files: ['./config/bot/media/marshDab.png']});
    }

    // grab member mention and ensure it's a member
    let member = getUserFromMention(args[0]);
    if (!member) {
  	   return message.channel.send(`**${message.author.username}**, you need to mention a user properly in order to dab on them!`);
    }
    if (member == message.author) { member = "themself"; }

    // initialize damage counter and set dab emoji
    var attackDamage = Math.floor(Math.random() * (Math.floor(1000) - Math.ceil(1) + 1) ) + Math.ceil(1);
    var dabEmote = "<:marshDab:648374543005777950>";

    if (attackDamage === 1) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
       "•  . . .\n" + `• **${attackDamage} HP** of damage.`);
    }
    else if (attackDamage <= 50) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
        `• **${attackDamage} HP** of damage! \n` + "• (Wasn't very effective...)");
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
    else if (attackDamage <= 999) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
        "• ***SMAAAASH!!*** \n" + `• A whoppin' **${attackDamage} HP** of mortal damage!`);
    }
    else {
      return message.channel.send(`• ${message.author} dabbed on ${member}! ${dabEmote}\n` +
        "• ***OUCH!!*** \n" + `• **${attackDamage} HP** of mortal damage?!?! You're really lucky to get that!`);
    }

    function getUserFromMention(mention) {
      // The id is the first and only match found by the RegEx.
      const matches = mention.match(/^<@!?(\d+)>$/);

      // If supplied variable was not a mention, matches will be null instead of an array.
      if (!matches) return;

      // However the first element in the matches array will be the entire mention, not just the ID,
      // so use index 1.
      const id = matches[1];

      return bot.users.cache.get(id);
    }
  }
}
