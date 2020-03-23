/*
This command is supposed to start a game where users can solve riddles against
other server members.
*/

module.exports = {
    config: {
        name: "riddle",
        aliases: ["riddlemethis", "rmt"],
        usage: "(start), (end)",
        category: "games",
        description: "Solve some riddles either against other server members or together!"
    },
    run: async (bot, message, args) => {

      return message.channel.send("This command is in the works. Please, stay tuned!");
    }
}
