module.exports = {
  config: {
      name: "dab",
      description: "Get the bot to dab or dab on someone!",
      usage: "m!dab (@mention)",
      category: "fun"
  },
  run: async (bot, message, args) => {

    // give user a regular dab when no argument
    if (!args || args.length < 1) {
      return message.channel.send("**Note:** If you want to dab on someone, just mention them!", {files: ['./media/marshDab.png']}).catch(console.error);
    }

    // grab member mention and ensure it's a member
    let member = message.mentions.members.first();
    if (!message.mentions.users.size) {
  	   return message.reply("you need to mention a user in order to dab on them!").catch(console.error);
    }

    // initialize damage counter
    var max = Math.floor(250);
    var min = Math.ceil(1);
    var attackDamage = Math.floor(Math.random() * (max - min + 1) ) + min;

    if (attackDamage === 1) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! <:marsh_dab:518597718353117194>\n` +
       "• ...\n" + `• ${attackDamage} HP of damage.`).catch(console.error);
    }
    else if (attackDamage <= 30) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! <:marsh_dab:518597718353117194>\n` +
        `• ${attackDamage} HP of damage! \n` + "• (Wasn\'t very effective...)").catch(console.error);
    }
    else if (attackDamage <= 80) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! <:marsh_dab:518597718353117194>\n` +
        `• ${attackDamage} HP of damage!`).catch(console.error);
    }
    else if (attackDamage <= 150) {
      return message.channel.send(`• ${message.author} dabbed on ${member}! <:marsh_dab:518597718353117194>\n` +
        "• Oh, baby! \n" + `• ${attackDamage} HP of damage!`).catch(console.error);
    }
    else {
      return message.channel.send(`• ${message.author} dabbed on ${member}! <:marsh_dab:518597718353117194>\n` +
        "• ***SMAAAASH!!*** \n" + `• ${attackDamage} HP of mortal damage!`).catch(console.error);
    }
  }
}
