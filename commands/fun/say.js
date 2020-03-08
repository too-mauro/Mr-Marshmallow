module.exports = {
  config: {
      name: "say",
      description: "Repeat whatever you say.",
      aliases: ["s", "parrot"],
      usage: "<text>",
      category: "fun"
  },
  run: async (bot, message, args) => {

    // check if bot has "manage messages" permissions
    if (!message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")) {
      return message.channel.send(`Sorry ${message.author.username}, I need the \`Manage Messages\` permission to do this!`).catch(console.error);
    }

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send(`**${message.author.username}**, you need to give me a message to say!`);
    }

    let text = args.join(" ");
    message.delete();
    message.channel.send(text).catch(console.error);
  }
}
