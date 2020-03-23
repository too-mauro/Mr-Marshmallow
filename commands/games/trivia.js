/*
This command is supposed to start a game where users can answer trivia questions
against other server members.
*/

module.exports = {
    config: {
        name: "trivia",
        aliases: ["triv", "t"],
        usage: "(start), (end)",
        category: "games",
        description: "Go against other server members in a game of trivia!"
    },
    run: async (bot, message, args) => {

      // trivia api link
      // https://opentdb.com/api.php?amount=50&type=multiple
      return message.channel.send("This command is in the works. Please, stay tuned!");
    }
}
