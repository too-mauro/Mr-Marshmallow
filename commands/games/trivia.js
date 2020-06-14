/*
This command is supposed to start a game where users can answer trivia questions
against other server members.
*/

const triviaAPI = "https://opentdb.com/api.php?amount=1";
const fetch = require("node-fetch");
const fs = require("fs");
const discord = require("discord.js");
const { blue_dark } = require("../../config/bot/colors.json");
let roster = [];
let maxPlayers = 10;
let maxRounds = 15;
let roundTime = 10;   // round time (in seconds)

module.exports = {
    config: {
        name: "trivia",
        aliases: ["triv", "t"],
        usage: "<about> <create> <join> <leave> <start> <end>",
        category: "games",
        description: "Go against other server members in a game of trivia!"
    },
    run: async (bot, message, args) => {
      return message.channel.send("This command is in the works. Please, stay tuned!");

      /*
      const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`, 'utf8'));

      if (args[0] && isNaN(args[0])) { args[0] = args[0].toLowerCase(); }
      switch (args[0]) {
        case 'about':
            const embed = new discord.MessageEmbed()
                .setColor(blue_dark)
                .setTitle("A good ol' game of Trivia!")
                .addField("**Rules**", `I'll ask a question, and it's up to everyone to figure out the correct answer. The first one with the correct answer gets 1 point for an easy question, 2 for a medium, and 3 for a hard. You only get ${roundTime} seconds to answer, so think quickly! The one with the most points at the end of the game wins!`)
                .addField("**Creating a Lobby**", `A game must have a lobby in order to start. If there is nobody there, do \`${serverConfig.prefix}trivia create\` to start a lobby.`)
                .addField("**Joining a Lobby**", `If there is a lobby already set up and you want to join, do \`${serverConfig.prefix}trivia join\`.`)
                .addField("**Leaving/Disbanding a Lobby**", `If you joined a lobby and want to leave, do \`${serverConfig.prefix}trivia leave\`. Only the host (the person who created a lobby) can disband it with \`${serverConfig.prefix}trivia end\`, which removes everyone from it.`)
                .addField("**Starting the Game**", `Only the host can start the game, and each lobby must have at least 1 player to start.`)
                .addField("**Ending the Game**", `During the game, anyone who was in the lobby can end it with \`${serverConfig.prefix}end\`, but that's not really a good idea.`)
                .setFooter(bot.user.username, bot.user.displayAvatarURL());
            return message.channel.send({embed});

        case 'create':
            if (roster.length > 0) {
              var rosterStr = '';
              for (var a = 0; a < roster.length; a++) {
                rosterStr += message.guild.members.cache.find(u => u.id === roster[a].player).user.tag + '\n';
              }
              return message.channel.send(`**${message.author.username}**, a trivia lobby has already been created! Here's the current roster:\n${rosterStr}`);
            }
            else if (serverConfig.games.triviaInProgress == true) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            await roster.push({"player": message.author.id, "score": 0});
            return message.channel.send(`**${message.author.username}**, a trivia lobby has been created! (${roster.length}/${maxPlayers} players in lobby)`);
            break;

        case 'end':
            if (roster.length < 1) {
              return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (serverConfig.games.triviaInProgress == true) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (roster[0].player !== message.author.id) {
              return message.channel.send(`Sorry **${message.author.username}**, only the host of the trivia room (${message.guild.members.cache.find(u => u.id === roster[0].player).user.username}) can disband it!`);
            }
            roster = [];
            return message.channel.send(`**${message.author.username}**, the trivia lobby has been disbanded! If you want to make another lobby, do \`${serverConfig.prefix}trivia create\`.`);
            break;

        case 'join':
            if (roster.length < 1) {
              return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (serverConfig.games.triviaInProgress == true) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (roster.length >= maxPlayers) {
              return message.channel.send(`**${message.author.username}**, the maximum amount of players have already joined! (${roster.length}/${maxPlayers} players in lobby)`);
            }
            if (roster.player.includes(message.author.id)) {
              return message.channel.send(`**${message.author.username}**, you've already joined the trivia lobby!`);
            }
            await roster.push({"player": message.author.id, "score": 0});
            return message.channel.send(`**${message.author.username}**, you've joined the trivia lobby! (${roster.length}/${maxPlayers} players in lobby)`);
            break;

        case 'leave':
            if (roster.length < 1) {
              return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (serverConfig.games.triviaInProgress == true) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }
            else if (roster[0].player == message.author.id) {
              return message.channel.send(`**${message.author.username}**, you can't leave the trivia lobby without disbanding it! If you want to disband, do \`${serverConfig.prefix}trivia end\`.`);
            }
            var inRoster = false;
            roster.forEach(player => {
              if (player.player.includes(message.author.id)) {
                inRoster = true;
                roster.splice(player, 1);
                return message.channel.send(`**${message.author.username}**, you've left the trivia lobby!  (${roster.length}/${maxPlayers} players in lobby)`);
              }
            });
            if (!inRoster) return message.channel.send(`**${message.author.username}**, you weren't in the trivia lobby!`);
            break;

        case 'start':
            if (roster.length < 1) {
              return message.channel.send(`**${message.author.username}**, a trivia room hasn't been created yet! If you want to make one, do \`${serverConfig.prefix}trivia create\`.`);
            }
            else if (roster[0].player !== message.author.id) {
              return message.channel.send(`Sorry **${message.author.username}**, only the host of the trivia room (${message.guild.members.cache.find(u => u.id === roster[0].player).user.username}) can start the game!`);
            }
            else if (serverConfig.games.triviaProgress == true) {
              return message.channel.send(`Sorry **${message.author.username}**, another game of trivia is currently ongoing! Please wait for the game to end, then try again.`);
            }

            if (roster.length < 2) { message.channel.send(`**${message.author.username}**, going solo I see? Well then, let's start!`); }
            else { message.channel.send("Okay everybody, let's start!"); }

            startGame(roster);

            function startGame(roster) {
              // lock the game into play, which prevents anyone from starting another game
              /*serverConfig.games.triviaInProgress = true;
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8', (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send(`Sorry **${message.author.username}**, I couldn't start the game!`);
                }
              });

              // initialize a round counter and push all entries to an array
              let round = 0;
              let rosterFilter = [];
              for (var f = 0; f < roster.length; f++) {
                rosterFilter.push(roster[f].player);
              }
              return startRound(round, roster, rosterFilter);
            }

            async function startRound(roundNum, roster, rFilter) {
              const response = await fetch(triviaAPI);
              const json = await response.json();
              let difficulty = json.results[0].difficulty;
              let answers = json.results[0].incorrect_answers.push(json.results[0].correct_answer);
              let question = decodeEntities(json.results[0].question);
              let points = 0;
              switch (difficulty) {
                case 'easy':       points = 1; break;
                case 'medium':     points = 2; break;
                case 'difficult':  points = 3; break;
              }
              message.channel.send(`**Round ${roundNum + 1}** (${difficulty})\n\n${question}\n*${shuffle(answers).join('\n')}*`).then(() => {
                message.channel.awaitMessages(response => rFilter.includes(response.author.id), {
                  max: 1,
                  time: roundTime * 1000,
                  errors: ['time'],
                })
                .then((collected) => {
                    if (collected.first().content.toLowerCase() == decodeEntities(json.results[0].correct_answer).toLowerCase()) {
                      return endRound(roundNum, roster, false, collected.author, points, rFilter);
                    }
                    else if (collected.first().content.toLowerCase() == `${serverConfig.prefix}end`) {
                      return endGame(true, collected.author, roster);
                    }
                })
                .catch(() => {
                  return endRound(roundNum, roster, true, null, points, rFilter);
                });
              });
            }

            function endRound(round, roster, timeout, author, points, filter) {
              if (timeout) { message.channel.send(`Looks like nobody got it! The correct answer was: \`${json.results[0].correct_answer}\`.\nMoving on...`); }
              else {
                let tally = '';
                for (var i = 0; i < roster.length; i++) {
                  if (roster[i].player == author.id) {
                    roster[i].score += points;
                  }
                  // tally scores
                  tally += `\`${message.guild.members.cache.find(u => u.id === roster[i].player).user.username}:  ${roster[i].score}\`\n`;
                }
                message.channel.send(`**${author.username}** got it! (+${points})\n\nCurrent Score:\n${tally}\n\nMoving on...`);
                tally = '';
              }
              round++;
              if (round < maxRounds) {
                  setTimeout(function () {
                    startRound(round, roster, filter);
                  }, 5000);
              }
              else { return endGame(false, author, roster, tally); }
            }

            function endGame(premature, author, roster, tally) {
              if (premature) {
                message.channel.send(`${author} called it quits on the game...!`);
              }
              else {
                // count up final scores
                var scoreArray = [];
                for (var i = 0; i < roster.length; i++) {
                  tally += `\`${message.guild.members.cache.find(u => u.id === roster[i].player).user.username}:  ${roster[i].score}\`\n`;
                  scoreArray.push(roster[i].score);
                }
                var winner = message.guild.members.cache.find(u => u.id === roster[indexOfMax(scoreArray)].player).user;
                message.channel.send(`Well, would you look at that? We've hit the end of the game! Here's the final tally:\n${tally}\n\n${winner} wins!`);
              }
              serverConfig.games.triviaInProgress = false;
              roster = [];
              fs.writeFile(`./config/server/${message.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8', (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send("Whoops, I couldn't clear out the trivia lobby!");
                }
              });

            }
            break;
      }
      */
    }
}

/*
function decodeEntities(encodedString) {
    var translate_re = /&(#039|nbsp|amp|quot|lt|gt|eacute|aring|iacute|aacute);/g;
    var translate = {
        "#039"    : "'",
        "nbsp"    : " ",
        "amp"     : "&",
        "quot"    : "\"",
        "lt"      : "<",
        "gt"      : ">",
        "eacute"  : "é",
        "aring"   : "å",
        "iacute"  : "í",
        "aacute"  : "á",
        "ntilde"  : "ñ",
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

function shuffle(array) {

	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }
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
*/
