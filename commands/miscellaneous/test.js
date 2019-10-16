module.exports = {
  config: {
      name: "test",
      description: "A simple 'hello world' message.",
      usage: "m!test",
      category: "miscellaneous"
  },
  run: async (bot, message, args) => {
  message.channel.send("Hello world!").catch(console.error);
}
}
