module.exports = {
  config: {
      name: "parrot",
      description: "Repeat whatever you say. Squawk!",
      usage: "m!parrot <whatever you say>",
      category: "fun"
  },
  run: async (bot, message, args) => {

    // check if bot has "manage messages" permissions
    if (!message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")) {
      return message.channel.send("**SQUAWK!** I need the `Manage Messages` permission to do this!").catch(console.error);
    }

    // check for arguments
    if (!args || args.length < 1) {
      return message.channel.send("**SQUAWK!** You need to give me a message to parrot!");
    }

    let text = args.join(" ");
    message.delete();
    message.channel.send(text).catch(console.error);
  }
}
