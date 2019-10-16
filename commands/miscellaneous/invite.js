module.exports = {
  config: {
      name: "invite",
      aliases: ["inv"],
      description: "Give out an invite link to the support server and bot!",
      usage: "m!invite",
      category: "miscellaneous"
  },
  run: async (bot, message, args) => {

  return message.channel.send("Want me to join your server? No problem! Here\'s my invite link: \n" +
  "[bot invite link coming soon, I\'m not ready yet!] \n\n" +
  "Need some help with something? Check out my server!\n" +
  "https://discord.gg/PFBgYvj").catch(err => {
    console.log(err);
    message.channel.send("Whoops, something went wrong! Why don\'t you check back later?");
  });
}
}
