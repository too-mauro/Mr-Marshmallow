/*
This command simply deletes the author's original message (if it has the
permission) and reverses it. For the message to be deleted, the bot needs the
`Manage Messages` permission.
*/

module.exports = {
  config: {
      name: "reverse",
      description: "Reverses whatever you say.",
      aliases: ["re", "yas"],
      usage: ["<text>"],
      category: "fun"
  },
  run: async (bot, message, args) => {

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, you need to give me a message to reverse!`);
    }

    // get everything after the message, join it as one combined string, then reverse it
    let text = args.join(" ").split("").reverse().join("");

    // check if bot has "manage messages" permissions
    if (message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")) { message.delete(); }
    return message.channel.send(text);

  }
}
