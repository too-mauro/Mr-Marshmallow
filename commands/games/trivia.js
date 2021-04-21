/*
This command is supposed to start a game where users can answer trivia questions
against other server members.
*/

const fetch = require("node-fetch");
const {readFileSync, writeFileSync} = require("fs");
const {decode} = require("he");
const {MessageEmbed} = require("discord.js");
const {blue_dark} = require("../../config/bot/colors.json");

module.exports = {
    config: {
        name: "trivia",
        description: "Go solo or against other server members in a game of trivia!",
        usage: "(about) (roster) (create) (join) (leave) (start) (end) (challenge)",
        aliases: ["triv", "t"],
        category: "games"
    },
    run: async (bot, message, args) => {
      const serverConfig = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8"));
      const maxPlayers = serverConfig.games.maxLobbyPlayers;
      const maxRounds = serverConfig.games.maxLobbyRounds;
      const lobbyConstruct = {
        gameInProgress: false,
        challengeModeEnabled: serverConfig.games.triviaCmEnabled,
        roster: []
      };
      let inLobby = false;

      // not constant variable in case user wants to do solo game without creating a lobby (the lobbyConstruct var will overwrite this)
      let triviaLobby = bot.triviaLobbies.get(message.guild.id);
      let promptActions = ["yes", "y", "no", "n"];

      if (args[0] && isNaN(args[0])) args[0] = args[0].toLowerCase();
      switch (args[0]) {
        case "about":
            const embed = new MessageEmbed()
                .setColor(blue_dark)
                .setTitle("A good ol' game of Trivia!")
                .addField("**Rules**", `I'll ask a question, and it's up to everyone to figure out the correct answer. The first one with the correct answer gets 1 point for an easy question, 2 for a medium one, and 3 for a hard one. Depending on the question, you have either 10, 20, or 30 seconds to answer, so think quickly but choose wisely; you only get one chance per round! The one with the most points at the end of the game wins!`)
                .addField("**Creating a Lobby**", `A game with at least two players must have a lobby in order to start. If there is no lobby yet, do \`${serverConfig.prefix}trivia create\` to start a lobby.`)
                .addField("**Joining a Lobby**", `If there is a lobby already set up and you want to join, do \`${serverConfig.prefix}trivia join\`.`)
                .addField("**Leaving/Disbanding a Lobby**", `If you joined a lobby and want to leave, do \`${serverConfig.prefix}trivia leave\`. Only the host (the person who created a lobby) can disband it with \`${serverConfig.prefix}trivia end\`, which removes everyone from it.`)
                .addField("**Starting the Game**", `Only the host can start the game, and each lobby must have at least 1 player to start.`)
                .addField("**Ending the Game**", `During the game, anyone who was in the lobby can end it with \`${serverConfig.prefix}end\`, but that will cut the game short.`)
                .addField("**Challenge Mode** (NEW!)", `If you want a little more difficulty, you can now try Challenge Mode! For each question you get wrong, your score will be subtracted by the question's point count. The host or an admin can toggle this with \`${serverConfig.prefix}trivia challenge\` before a game starts.`)
                .setFooter(bot.user.username, bot.user.displayAvatarURL());
            return message.channel.send({embed});
            break;

        case "roster":
          if (!triviaLobby) {
            return message.channel.send(`**${message.author.username}**, a trivia lobby hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
          }
          else {
            let rosterStr = "";
            triviaLobby.roster.forEach(entry => {
              rosterStr += `${entry.user.tag}\n`;
            });
            rosterStr += `\nChallenge Mode **${triviaLobby.challengeModeEnabled ? "ON" : "OFF"}**`;
            return message.channel.send(`**${message.author.username}**, here's the current roster:\n${rosterStr}`);
          }
          break;

        case "create":
            if (triviaLobby && !triviaLobby.gameInProgress) {
              let rosterStr = "";
              triviaLobby.roster.forEach(entry => {
                rosterStr += `${entry.user.tag}\n`;
              });
              rosterStr += `\nChallenge Mode **${triviaLobby.challengeModeEnabled ? "ON" : "OFF"}**`;
              return message.channel.send(`**${message.author.username}**, a trivia lobby has already been created! Here's the current roster:\n${rosterStr}`);
            }
            else if (triviaLobby && triviaLobby.gameInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }

            lobbyConstruct.roster.push({
              user: message.author,
              score: 0
            });
            bot.triviaLobbies.set(message.guild.id, lobbyConstruct);
            return message.channel.send(`**${message.author.username}**, a trivia lobby has been created! (${lobbyConstruct.roster.length}/${maxPlayers} players in lobby)`);
            break;

        case "end":
            if (!triviaLobby) {
              return message.channel.send(`**${message.author.username}**, a trivia lobby hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (triviaLobby.gameInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (triviaLobby.roster[0].user !== message.author || !message.member.hasPermission("ADMINISTRATOR")) {
              return message.channel.send(`Sorry **${message.author.username}**, only the host of the trivia lobby (${triviaLobby.roster[0].user.tag}) or an admin can disband it!`);
            }
            bot.triviaLobbies.delete(message.guild.id);
            return message.channel.send(`**${message.author.username}**, the trivia lobby has been disbanded! If you want to make another lobby, do \`${serverConfig.prefix}trivia create\`.`);
            break;

        case "join":
            if (!triviaLobby) {
              return message.channel.send(`**${message.author.username}**, a trivia lobby hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (triviaLobby.gameInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (triviaLobby.roster.length >= maxPlayers) {
              return message.channel.send(`**${message.author.username}**, the maximum amount of players have already joined! (${triviaLobby.roster.length}/${maxPlayers} players in lobby)`);
            }
            inLobby = false;
            triviaLobby.roster.forEach(entry => {
              if (entry.user == message.author) {
                inLobby = true;
                return message.channel.send(`**${message.author.username}**, you've already joined the trivia lobby!`);
              }
            });
            if (!inLobby) {
              triviaLobby.roster.push({
                user: message.author,
                score: 0
              });
              return message.channel.send(`**${message.author.username}**, you've joined the trivia lobby! (${triviaLobby.roster.length}/${maxPlayers} players in lobby)`);
            }
            break;

        case "leave":
            if (!triviaLobby) {
              return message.channel.send(`**${message.author.username}**, a trivia lobby hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (triviaLobby.gameInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (triviaLobby.roster[0].user == message.author) {
              return message.channel.send(`**${message.author.username}**, you can't leave the trivia lobby without disbanding it! If you want to disband, do \`${serverConfig.prefix}trivia end\`.`);
            }
            inLobby = false;
            triviaLobby.roster.forEach((entry, index) => {
              if (entry.user == message.author) {
                inLobby = true;
                triviaLobby.roster.splice(triviaLobby.roster[index], 1);
                return message.channel.send(`**${message.author.username}**, you've left the trivia lobby!  (${triviaLobby.roster.length}/${maxPlayers} players in lobby)`);
              }
            });
            if (!inLobby) return message.channel.send(`**${message.author.username}**, you weren't in the trivia lobby!`);
            break;

        case "start":
            if (!triviaLobby) {
              message.channel.send(`**${message.author.username}**, a trivia lobby hasn't been created yet! Did you want to start a solo game? (y/n)`).then(() => {
                message.channel.awaitMessages(response => response.author.id == message.author.id && promptActions.includes(response.content), { max: 1, time: 10000, errors: ["time"]})
                .then((collected) => {
                  let res = collected.first().content.toLowerCase();
                  if (res == "yes" || res == "y") {
                    // prep the lobby of one
                    lobbyConstruct.roster.push({
                      user: message.author,
                      score: 0
                    });
                    bot.triviaLobbies.set(message.guild.id, lobbyConstruct); // needed for the end of the game
                    triviaLobby = lobbyConstruct; // ensures the game runs smoothly without anything screwing up

                    message.channel.send(`OK, **${message.author.username}**, let's begin!`);
                    return setTimeout(() => startGame(), 3000);
                  }
                  else if (res == "no" || res == "n") {
                    return message.channel.send(`Alright, no problem. If you want to make a lobby, do \`${serverConfig.prefix}trivia create\`.`);
                  }
                })
                .catch(() => {
                  return message.channel.send(`I'll guess you didn't want to start yet. If you want to make a lobby, do \`${serverConfig.prefix}trivia create\`.`);
                });
              });
            }
            else if (triviaLobby.gameInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (triviaLobby.roster[0].user !== message.author) {
              return message.channel.send(`Sorry **${message.author.username}**, only the host of the trivia lobby (${triviaLobby.roster[0].user.tag}) can start the game!`);
            }
            else {
              let startMessage = (triviaLobby.roster.length == 1) ? `Going solo, **${message.author.username}**? Well then` : "Okay everybody";
              message.channel.send(`${startMessage}, let's begin!`);
              return setTimeout(() => startGame(), 3000);
            }
            break;

        case "challenge":
            if (!triviaLobby) {
              return message.channel.send(`**${message.author.username}**, a trivia lobby hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (triviaLobby.gameInProgress) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (triviaLobby.roster[0].user !== message.author || !message.member.hasPermission("ADMINISTRATOR")) {
              return message.channel.send(`Sorry **${message.author.username}**, only the host of the trivia lobby (${triviaLobby.roster[0].user.tag}) or an admin can toggle Challenge Mode!`);
            }
            triviaLobby.challengeModeEnabled = !triviaLobby.challengeModeEnabled;
            let check = (triviaLobby.challengeModeEnabled) ? "enabled" : "disabled";
            return message.channel.send(`**${message.author.username}**, Challenge Mode is now ${check}!`);
            break;

        default:
          return message.channel.send("**A good ol' game of Trivia!**\nUse the below arguments to do the following:\n- about: see the rules\n- roster: show the current roster, if a lobby has been created\n- create: create a lobby if one isn't already made\n- join: join an existing lobby\n- leave: leave a current lobby\n- start: start the game (restricted to the host)\n- end: disbands an active lobby (restricted to the host or admin)\n- challenge: toggle Challenge Mode (restricted to the host or admin) **[NEW!]**");
          break;
      }

      async function startGame() {
        // get the questions from the trivia database
        try {
          await fetch(`https://opentdb.com/api.php?amount=${maxRounds}`)
            .then(res => res.json())
            .then(json => {
              // lock the game into play, which prevents anyone from starting another game
              triviaLobby.gameInProgress = true;
              return startRound(0, json.results);
            });
        }
        catch (err) {
          // in case the API isn't available or any error occurs, stop here. without the questions, there's no game
          console.error(err);
          triviaLobby.gameInProgress = false;
          return message.channel.send(`Sorry **${message.author.username}**, I couldn't start the game. I lost my question cards! Maybe try again later?`);
        }
      }

      function startRound(roundNum, triviaQuestions) {
        let roundInfo = triviaQuestions.shift();
        let question = decode(roundInfo.question);
        let points = 0;
        let tally = "";
        switch (roundInfo.difficulty) {
          case "easy": points = 1; break;
          case "medium": points = 2; break;
          case "hard": points = 3; break;
          default: points = 1; break;
        }

        // add the correct answer to the answer array and mix up the order
        roundInfo.incorrect_answers.push(roundInfo.correct_answer);
        let answers = roundInfo.incorrect_answers.reverse();
        for (let i = answers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * i);
          const temp = answers[i];
          answers[i] = answers[j];
          answers[j] = temp;
        }

        // make the choices look nice
        let choices = "";
        answers.forEach((answer, index) => choices += `${index + 1}. **${decode(answer)}**\n`);

        let wrongAnswerUsers = [];
        let prematureEnd = false;

        message.channel.send(`**Round ${roundNum + 1}** (${roundInfo.difficulty}, ${points * 10} seconds to answer)\nType one of the choices or the corresponding number.\n\`\`\`${decode(roundInfo.question)}\`\`\`\n${decode(choices)}`);

        const collector = message.channel.createMessageCollector(msg => triviaLobby.roster.some(entry => entry.user == msg.author), { time: points * 10000 });
        let correctlyAnswered = false;

        collector.on("collect", msg => {
          if (msg.content.toLowerCase() == `${serverConfig.prefix}end`) {
            prematureEnd = true;
            collector.stop();
          }
          else if (wrongAnswerUsers.includes(msg.author)) {
            return msg.channel.send(`Sorry, **${msg.author.username}**, you already answered!`);
          }
          else if ((parseInt(msg.content) && answers[msg.content - 1] == roundInfo.correct_answer) || (msg.content.toLowerCase() == decode(roundInfo.correct_answer.toLowerCase()))) {
            correctlyAnswered = true;
            collector.stop();
          }
          else {
            wrongAnswerUsers.push(msg.author);
            if (triviaLobby.challengeModeEnabled) {
              let currentScore = 0;
              triviaLobby.roster.forEach(entry => {
                if (entry.user == msg.author) {
                  if (entry.score - points < 0) entry.score = 0;
                  else entry.score -= points;
                  currentScore = entry.score;
                }
              });
              message.channel.send(`Sorry **${msg.author.username}**, that's going to cost you ${points} point(s)! Your score: \`${currentScore}\`\nYou won't be able to answer again until the next round.`);
            }
            else {
              message.channel.send(`Sorry **${msg.author.username}**, that's not the right answer!\nYou won't be able to answer again until the next round.`);
            }
          }
        });

        collector.on("end", collected => {
          if (prematureEnd) {
            endGame(true, collected.last().author);
          }
        	else {
            if (correctlyAnswered) {
              triviaLobby.roster.forEach((entry, index) => {
                // add points and tally scores
                if (entry.user == collected.last().author) {
                  entry.score += points;
                }
                tally += `\`${entry.user.username}:  ${entry.score}\`\n`;
              });
              message.channel.send(`**${collected.last().author.username}** got it! (+${points})\n\nCurrent Score:\n${tally}\nMoving on...`);
              tally = "";
            }
            else {
              message.channel.send(`Looks like nobody got it! The correct answer was:  \` ${decode(roundInfo.correct_answer)} \`\nMoving on...`);
            }
            roundNum++;
            setTimeout(() => {
              if (roundNum < maxRounds || triviaQuestions.length > 0) {
                  startRound(roundNum, triviaQuestions);
              }
              else {
                  endGame(false, null);
              }
            }, 5000);
         }
        });
      }

      function endGame(premature, author) {
        let tally = "";
        let winnerArray = [];
        triviaLobby.roster.forEach((entry, index) => tally += `\`${entry.user.username}:  ${entry.score}\`\n`);
        getHighestScoreIndexes(triviaLobby.roster).forEach(inx => winnerArray.push(triviaLobby.roster[inx].user));
        let winMessage = (winnerArray.length > 1) ? "**TIE!** WINNERS" : "WINNER";
        let endMessage = (premature) ? `Welp, game over! ${author} called it quits! Here's the tally so far:` : "Well, would you look at that? We're already at the end of the game! Here's the final tally:";
        message.channel.send(`${endMessage}\n${tally}\n${winMessage}: ${winnerArray.join(", ")}`);

        setTimeout(() => {
            message.channel.send(`${triviaLobby.roster[0].user}, would you like to start a new game with the same roster and settings? (y/n)`)
            .then(() => {
              message.channel.awaitMessages(response => response.author.id == triviaLobby.roster[0].user.id && promptActions.includes(response.content), { max: 1, time: 10000, errors: ["time"] })
              .then((collected) => {
                let res = collected.first().content.toLowerCase();
                if (res == "yes" || res == "y") {
                  // reset all scores to zero
                  triviaLobby.roster.forEach(entry => {
                    entry.score = 0;
                  });
                  message.channel.send("OK, get ready, here we go!");
                  return setTimeout(() => startGame(), 3000);
                }
                else if (res == "no" || res == "n") {
                  message.channel.send("Alright, thanks for playing!");
                }
              })
              .catch(() => {
                message.channel.send("Welp, time's up! Thanks for playing!");
              });
            });
        }, 3000);
        // Remove the lobby, which also unlocks the game playing status
        bot.triviaLobbies.delete(message.guild.id);
      }
    }
}

function getHighestScoreIndexes(roster) {
  let scoreArray = [];
  roster.forEach(entry => scoreArray.push(entry.score));
  let max = 0;
  let maxIndexes = [];
  scoreArray.forEach((playerScore, index) => {
    if (playerScore > max) {
      // if a higher score is found, drop everything and use the new score's index
      maxIndexes.length = 0;
      maxIndexes.push(index);
      max = playerScore;
    }
    else if (playerScore == max) {
      // just add scores with the same value if one is found
      maxIndexes.push(index);
    }
  });
  // at least one entry will be in the array
  return maxIndexes;
}
