/*
This command is supposed to start a game where users can answer trivia questions
against other server members.
*/

const fetch = require("node-fetch");
const fs = require("fs");
const he = require("he");
const discord = require("discord.js");
const { blue_dark } = require("../../config/bot/colors.json");
const triviaAPI = "https://opentdb.com/api.php?amount=1";
const maxPlayers = 10;
const maxRounds = 15;
let roster = [];

module.exports = {
    config: {
        name: "trivia",
        aliases: ["triv", "t"],
        usage: "(about) (roster) (create) (join) (leave) (start) (end)",
        category: "games",
        description: "Go against other server members in a game of trivia!"
    },
    run: async (bot, message, args) => {

      const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));

      let rp = 0;
      if (args[0] && isNaN(args[0])) { args[0] = args[0].toLowerCase(); }
      switch (args[0]) {
        case 'about':
            const embed = new discord.MessageEmbed()
                .setColor(blue_dark)
                .setTitle("A good ol' game of Trivia!")
                .addField("**Rules**", `I'll ask a question, and it's up to everyone to figure out the correct answer. The first one with the correct answer gets 1 point for an easy question, 2 for a medium, and 3 for a hard. Depending on the question, you have either 10, 20, or 30 seconds to answer, so think quickly but choose wisely; you only get one chance per round! The one with the most points at the end of the game wins!`)
                .addField("**Creating a Lobby**", `A game must have a lobby in order to start. If there is nobody there, do \`${serverConfig.prefix}trivia create\` to start a lobby.`)
                .addField("**Joining a Lobby**", `If there is a lobby already set up and you want to join, do \`${serverConfig.prefix}trivia join\`.`)
                .addField("**Leaving/Disbanding a Lobby**", `If you joined a lobby and want to leave, do \`${serverConfig.prefix}trivia leave\`. Only the host (the person who created a lobby) can disband it with \`${serverConfig.prefix}trivia end\`, which removes everyone from it.`)
                .addField("**Starting the Game**", `Only the host can start the game, and each lobby must have at least 1 player to start.`)
                .addField("**Ending the Game**", `During the game, anyone who was in the lobby can end it with \`${serverConfig.prefix}end\`, but that's not really a good idea.`)
                .setFooter(bot.user.username, bot.user.displayAvatarURL());
            return message.channel.send({embed});
            break;

        case 'roster':
          if (roster.length < 1) {
            return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
          }
          else {
            var rosterStr = '';
            for (var a = 0; a < roster.length; a++) {
              rosterStr += roster[a].player.tag + '\n';
            }
            return message.channel.send(`**${message.author.username}**, here's the current roster:\n${rosterStr}`);
          }
          break;

        case 'create':
            if (roster.length > 0) {
              var rosterStr = '';
              for (var a = 0; a < roster.length; a++) {
                rosterStr += roster[a].player.tag + '\n';
              }
              return message.channel.send(`**${message.author.username}**, a trivia lobby has already been created! Here's the current roster:\n${rosterStr}`);
            }
            else if (serverConfig.games.triviaInProgress == true) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            await roster.push({"player": message.author, "score": 0});
            return message.channel.send(`**${message.author.username}**, a trivia lobby has been created! (${roster.length}/${maxPlayers} players in lobby)`);
            break;

        case 'end':
            if (roster.length < 1) {
              return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (serverConfig.games.triviaInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (roster[0].player !== message.author) {
              return message.channel.send(`Sorry **${message.author.username}**, only the host of the trivia room (${roster[0].player.tag}) can disband it!`);
            }
            roster = [];
            return message.channel.send(`**${message.author.username}**, the trivia lobby has been disbanded! If you want to make another lobby, do \`${serverConfig.prefix}trivia create\`.`);
            break;

        case 'join':
            if (roster.length < 1) {
              return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (serverConfig.games.triviaInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (roster.length >= maxPlayers) {
              return message.channel.send(`**${message.author.username}**, the maximum amount of players have already joined! (${roster.length}/${maxPlayers} players in lobby)`);
            }
            for (rp = 0; rp < roster.length; rp++) {
              if (roster[rp].player == message.author) {
                return message.channel.send(`**${message.author.username}**, you've already joined the trivia lobby!`);
              }
            }
            await roster.push({"player": message.author, "score": 0});
            return message.channel.send(`**${message.author.username}**, you've joined the trivia lobby! (${roster.length}/${maxPlayers} players in lobby)`);
            break;

        case 'leave':
            if (roster.length < 1) {
              return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (serverConfig.games.triviaInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (roster[0].player == message.author) {
              return message.channel.send(`**${message.author.username}**, you can't leave the trivia lobby without disbanding it! If you want to disband, do \`${serverConfig.prefix}trivia end\`.`);
            }
            var inRoster = false;
            for (rp = 0; rp < roster.length; rp++) {
              if (roster[rp].player == message.author) {
                inRoster = true;
                roster.splice(roster[rp], 1);
                return message.channel.send(`**${message.author.username}**, you've left the trivia lobby!  (${roster.length}/${maxPlayers} players in lobby)`);
              }
            }
            if (!inRoster) return message.channel.send(`**${message.author.username}**, you weren't in the trivia lobby!`);
            break;

        case 'start':
            if (roster.length < 1) {
              return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (serverConfig.games.triviaProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (roster[0].player !== message.author) {
              return message.channel.send(`Sorry **${message.author.username}**, only the host of the trivia room (${message.guild.members.cache.find(u => u.id === roster[0].player).username}) can start the game!`);
            }

            if (roster.length < 2) { message.channel.send(`Going solo, **${message.author.username}**? Well then, let's start!`); }
            else { message.channel.send("Okay everybody, let's start!"); }

            startGame(roster);

            function startGame(roster) {
              // lock the game into play, which prevents anyone from starting another game
              serverConfig.games.triviaInProgress = true;
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8', (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send(`Sorry **${message.author.username}**, I couldn't start the game!`);
                }
                // initialize a round counter and push all entries to an array
                let round = 0;
                let rosterFilter = [];
                for (var f = 0; f < roster.length; f++) {
                  rosterFilter.push(roster[f].player);
                }
                return startRound(round, roster, rosterFilter);
              });
            }
            break;

        default:
          return message.channel.send(`**A good ol' game of Trivia!**\nUse of the below arguments to do the following:\n- about: see the rules\n- roster: show the current roster, if a lobby has been created\n- create: create a lobby if one isn't already made\n- join: join an existing lobby\n- leave: leave a current lobby\n- start: start the game (restricted to the host)\n- end: disbands an active lobby (restricted to the host)`);
          break;
      }

      async function startRound(roundNum, roster, rFilter) {
        const response = await fetch(triviaAPI).then(res => res.json());
        let difficulty = response.results[0].difficulty;
        let question = he.decode(response.results[0].question);
        let points = 0;
        let tally = '';
        switch(difficulty) {
          case "easy": points = 1; break;
          case "medium": points = 2; break;
          case "hard": points = 3; break;
          default: break;
        }

        response.results[0].incorrect_answers.push(response.results[0].correct_answer);
        let answers = response.results[0].incorrect_answers;
        for (let i = answers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * i);
          const temp = answers[i];
          answers[i] = answers[j];
          answers[j] = temp;
        }

        // make the choices look nice
        let choices = "";
        for (let a = 0; a < answers.length; a++) {
          choices += `${a + 1}. **${he.decode(answers[a])}**\n`;
        }

        let wrongAnswerUsers = [];
        let prematureEnd = false;

        message.channel.send(`**Round ${roundNum + 1}** (${difficulty}, ${points * 10} seconds to answer)\nType one of the choices or the corresponding number.\n\`\`\`${he.decode(response.results[0].question)}\`\`\`\n${he.decode(choices)}`);

        const collector = message.channel.createMessageCollector(m => rFilter.includes(m.author), { time: points * 10000 });
        let correctlyAnswered = false;

        collector.on('collect', m => {
          if (m.content.toLowerCase() == `${serverConfig.prefix}end`) {
            prematureEnd = true;
            collector.stop();
          }
          else if (wrongAnswerUsers.includes(m.author)) {
            return m.channel.send(`Sorry, **${m.author.username}**, you already answered!`);
          }
          else if ((parseInt(m.content) && answers[m.content - 1] == response.results[0].correct_answer) || (m.content.toLowerCase() == he.decode(response.results[0].correct_answer.toLowerCase()))) {
            correctlyAnswered = true;
            collector.stop();
          }
          else {
            message.channel.send(`Sorry **${m.author.username}**, that's not the right answer! You can't answer again until the next round.`);
            wrongAnswerUsers.push(m.author);
          }
        });

        collector.on('end', collected => {
          if (prematureEnd) {
            endGame(true, collected.last().author, roster, tally);
          }
        	else {
            if (correctlyAnswered) {
              for (var i = 0; i < roster.length; i++) {
                if (roster[i].player == collected.last().author) {
                  roster[i].score += points;
                }
                // tally scores
                tally += `\`${roster[i].player.username}:  ${roster[i].score}\`\n`;
              }
              message.channel.send(`**${collected.last().author.username}** got it! (+${points})\n\nCurrent Score:\n${tally}\nMoving on...`);
              tally = '';
            }
            else {
              message.channel.send(`Looks like nobody got it! The correct answer was:  \` ${he.decode(response.results[0].correct_answer)} \`\nMoving on...`);
            }
            roundNum++;
            if (roundNum < maxRounds) {
              setTimeout(function () {
                startRound(roundNum, roster, rFilter);
              }, 5000);
            }
            else { endGame(false, null, roster, tally); }
         }
       });
      }

      function endGame(premature, author, roster, tally) {
        serverConfig.games.triviaInProgress = false;
        fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8', (err) => {
          if (err) {
            console.log(err);
            return message.channel.send("Whoops, I couldn't clear out the trivia lobby!");
          }
          else if (premature) {
            message.channel.send(`Welp, game over! ${author} called it quits!`);
          }
          else {
            // count up final scores
            var scoreArray = [];
            for (var i = 0; i < roster.length; i++) {
              tally += `\`${roster[i].player.username}:  ${roster[i].score}\`\n`;
              scoreArray.push(roster[i].score);
            }
            var winner = roster[indexOfMax(scoreArray)].player;
            message.channel.send(`Well, would you look at that? We're already at the end of the game! Here's the final tally:\n${tally}\n${winner} wins!`);
          }
          roster = [];
        });
      }
    }
}

function indexOfMax(arr) {
    if (arr.length === 0) return -1;
    var max = arr[0];
    var maxIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}
