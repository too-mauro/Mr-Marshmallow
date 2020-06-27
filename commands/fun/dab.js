/*
This command returns a picture of Mr. Marshmallow dabbing without a user mention.
With one, the user can dab on another user EarthBound-style, and, with luck and a
trusty random number generator, they can output up to 1000 damage!
*/

module.exports = {
  config: {
      name: "dab",
      description: "Get the bot to dab or dab on someone!",
      usage: "(@mention)",
      category: "fun",
      aliases: ["d"]
  },
  run: async (bot, message, args) => {

    // If there is no argument, just give the user a regular dab.
    const dabEmote = "<:marshDab:648374543005777950>";
    if (!args || args.length < 1) {
      if (message.guild.me.hasPermission("ATTACH_FILES")) {
        return message.channel.send({files: ["./config/bot/media/marshDab.png"]});
      }
      else return message.channel.send(dabEmote);
    }

    // grab member mention and ensure it's a member
    let member = getUserFromMention(args[0], message.guild);
    if (!member) {
  	   return message.channel.send(`**${message.author.username}**, you need to mention a user properly to dab on them!`);
    }

    // If the person decides to mention themself, replace the second mention with the word "themself".
    if (member.user == message.author) { member = "themself"; }

    const attackDamage = Math.floor(Math.random() * (Math.floor(1000) - Math.ceil(1) + 1) ) + Math.ceil(1);
    const battleMessage = `• ${message.author} tried dabbing on ${member}! ${dabEmote}`;
    let customText;

    if (attackDamage <= 25) { customText = `• It had no effect!`; }
    else if (attackDamage <= 100) { customText = `• **${attackDamage} HP** of damage!`; }
    else if (attackDamage <= 450) { customText = `• Oh, baby!\n• **${attackDamage} HP** of damage!`; }
    else if (attackDamage <= 750) { customText = `• *WOWZA!*\n• **${attackDamage} HP** of damage!`; }
    else { customText = `• ***SMAAAASH!!***\n• A whoppin' **${attackDamage} HP** of mortal damage!`; }

    return message.channel.send(`${battleMessage}\n${customText}`);
  }
}

function getUserFromMention(mention, guild) {
  // The id is the first and only match found by the RegEx.
  const matches = mention.match(/^<@!?(\d+)>$/);
  // If supplied variable was not a mention, matches will be null instead of an array.
  if (!matches) return;
  // However the first element in the matches array will be the entire mention, so use index 1.
  return guild.members.cache.get(matches[1]);
}
