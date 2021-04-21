/*
This command is supposed to start a game where users can engage in turn-based battle
against other server members or the bot.
*/

const {readFileSync} = require("fs");
const {MessageEmbed} = require("discord.js");
const {blue_dark} = require("../../config/bot/colors.json");
const {getUserFromMention} = require("../../config/bot/util.js");

module.exports = {
    config: {
        name: "battle",
        description: "Battle against another server member in turn-based combat!",
        usage: "<user mention>",
        aliases: ["fight", "btl"],
        category: "games"
    },
    run: async (bot, message, args) => {

      const serverPrefix = JSON.parse(readFileSync(`./config/server/${message.guild.id}/config.json`, "utf8")).prefix;
      if (!args || args.length < 1) {
        // explain the rules
        const embed = new MessageEmbed()
            .setColor(blue_dark)
            .setTitle("A turn-based Battle game!")
            .addField("**Rules**", "Each player takes turns to deplete the other player's HP to 0 before they do the same to you! Everyone starts off with 1000 HP, 400 MP, and 10 healing items.")
            .addField("**Starting a Game with Another Server Member**", `To challenge another server member, do \`${serverPrefix}battle <user mention>.\` Once you and the other member are ready, turn order is randomly decided with a coin flip.`)
            .addField("**Starting a Solo Game**", `You can play a solo game by mentioning me, too! I will always let you go first.\n**Be warned:** I may look soft, but I pack a punch!`)
            .addField("**Available Options**", "There are five actions:\n\`attack\` (a basic attack),\n\`magic\` (a spell that costs 20 MP each),\n\`defend\` (allows you to take less damage for one turn),\n\`heal\` (use a healing item), and\n\`run\` (run away if you must).\n\n**You have three minutes per turn to make a choice**; if you don't choose, you forfeit your turn and the other player will get to go.")
            .setFooter(bot.user.username, bot.user.displayAvatarURL());
        return message.channel.send({embed});
      }

      let battleLobby = bot.battleGames.get(message.channel.id); // unlike trivia and music, use channel id instead of server
      const battleConstruct = { roster: [] };

      if (battleLobby) {
        return message.channel.send(`**${message.author.username}**, another game is going on in this channel! Wait for it to finish, then try again.`);
      }
      let maxHP = 1000;
      let maxMP = 400;
      let maxHeals = 10;
      let bothPlayersStanding;

      let promptActions = ["yes", "y", "no", "n"];
      let member = getUserFromMention(args[0], message.guild);
      if (!member) {
        return message.channel.send(`**${message.author.username}**, please use a proper mention if you want to fight them.`);
      }
      else if (member.user == message.author) {
        // the message's author can't exactly fight themself
        return message.channel.send(`Hmmm, don't think you can fight yourself, **${message.author.username}**. Maybe try pinging someone else.`);
      }
      else if (member.user == bot.user) {
        // ask the user if they want to fight Mr. Marshmallow
        message.channel.send(`You sure you want to fight me, **${message.author.username}**? I may look soft, but I pack a punch. (y/n)`)
        .then(() => {
          message.channel.awaitMessages(response => response.author.id == message.author.id && promptActions.includes(response.content), { max: 1, time: 60000, errors: ["time"] })
          .then((collected) => {
            let res = collected.first().content.toLowerCase();
            if (res == "yes" || res == "y") {
              // initialize the battle sequence
              return initializeBattle(message.author, bot.user);
            }
            else if (res == "no" || res == "n") {
              message.channel.send(`Alright then, **${message.author.username}**. Maybe another time.`);
            }
          })
          .catch(() => {
            message.channel.send(`I guess you weren't up for it, **${message.author.username}**. Ah well, maybe a later time.`);
          });
        });
      }
      else if (member.user.bot) {
        // user can't fight other bots
        return message.channel.send(`Hey, uh, **${message.author.username}**? Maybe you shouldn't fight **${member.user.username}**? Looks like they're trying to do their job.`);
      }
      else {
        message.channel.send(`Hey ${member.user}, ${message.author} has challenged you to a battle! Do you accept? (y/n)`)
        .then(() => {
          message.channel.awaitMessages(response => response.author.id == member.user.id && promptActions.includes(response.content), { max: 1, time: 60000, errors: ["time"] })
          .then((collected) => {
            let res = collected.first().content.toLowerCase();
            if (res == "yes" || res == "y") {
              // initialize the battle sequence
              return initializeBattle(message.author, member.user);
            }
            else if (res == "no" || res == "n") {
              message.channel.send(`**${member.user.username}** isn't up for it. Ah well, maybe another time, **${message.author.username}**.`);
            }
          })
          .catch(() => {
            message.channel.send(`I guess **${member.user.username}** wasn't up for it, maybe another time, **${message.author.username}**.`);
          });
        });
      }

      function initializeBattle(playerOne, playerTwo) {
        for (let c = 0; c < arguments.length; c++) {
          battleConstruct.roster.push({
            user: arguments[c],
            hp: maxHP,
            mp: maxMP,
            guarding: false,
            heals: maxHeals
          });
        }
        battleLobby = battleConstruct;
        return beginBattle();
      }

      function beginBattle() {
        /* determine turn order.
        the one who initiated the fight is considered player one, the member mentioned is player two.
        if player is fighting the bot, always let the human player go first. */
        let playerOneTurn = (battleLobby.roster[1].user.bot) ? true : (Math.random() < 0.5);
        let playerOne = battleLobby.roster[(playerOneTurn) ? 0 : 1].user;
        let playerTwo = battleLobby.roster[(playerOneTurn) ? 1 : 0].user;
        message.channel.send(`Here is the turn order for this battle:\n**${playerOne}** first, then **${playerTwo}**.\n\nReady? Let's begin!`);
        return setTimeout(() => beginPlayerTurn(playerOneTurn), 3000);
      }

      function beginPlayerTurn(playerOneTurn) {
        let currentPlayer = battleLobby.roster[(playerOneTurn) ? 0 : 1];
        let otherPlayer = battleLobby.roster[(playerOneTurn) ? 1 : 0];
        if (currentPlayer.guarding) {
          currentPlayer.guarding = false; // make the user stop guarding
        }

        let hud;
        if (otherPlayer.user.bot) {
          // bot doesn't show command choice prompt, so display both users' info
          hud = `\`\`\`- ${currentPlayer.user.username} -\nHP: ${currentPlayer.hp}/${maxHP} | MP: ${currentPlayer.mp}/${maxMP} | ${currentPlayer.heals} healing item(s) ${currentPlayer.guarding ? "| guarding" : ""}\n- ${otherPlayer.user.username} -\nHP: ${otherPlayer.hp}/${maxHP} | MP: ${otherPlayer.mp}/${maxMP} | ${otherPlayer.heals} healing item(s) ${otherPlayer.guarding ? "| guarding" : ""}\`\`\``;
        }
        else {
          // just show the current player's info
          hud = `\`\`\`- ${currentPlayer.user.username} -\nHP: ${currentPlayer.hp}/${maxHP} | MP: ${currentPlayer.mp}/${maxMP} | ${currentPlayer.heals} healing item(s) ${currentPlayer.guarding ? "| guarding" : ""}\`\`\``;
        }

        let turnActions = ["a", "attack", "atk", "d", "defend", "def", "guard", "m", "magic", "mgc", "h", "heal", "r", "run"];
        message.channel.send(`**${currentPlayer.user}'s turn!**  Choose one:\n• :dagger: **a**/**attack**/**atk** (attack)\n• :sparkles: **m**/**magic**/**mgc** (perform a magic attack; costs 20 MP)\n• :shield: **d**/**defend**/**def**/**guard** (reduces damage taken until next turn)\n• :heart: **h**/**heal** (recover some HP with a healing item)\n• :dash: **r**/**run** (try running away, 40% chance of success)\n${hud}`)
        .then(() => {
          message.channel.awaitMessages(response => response.author.id == currentPlayer.user.id && turnActions.includes(response.content), { max: 1, time: 180000, errors: ["time"] })
          .then((collected) => {
            bothPlayersStanding = performTurnAction(collected.first().content.toLowerCase(), currentPlayer, otherPlayer, 1, 1.5);
            setTimeout(() => {
              if (bothPlayersStanding) {
                // if player is fighting bot, call bot turn function since it can't pick its own command via prompt
                if (otherPlayer.user.bot) return beginBotTurn(!playerOneTurn);
                else return beginPlayerTurn(!playerOneTurn);
              }
              else return endBattle();
            }, 1500);
          })
          .catch(() => {
            // player took too long to pick an option
            message.channel.send(`Time's up, ${currentPlayer.user}! Looks like you forfeit your turn.`);
            return setTimeout(() => beginPlayerTurn(!playerOneTurn), 1500);
          });
        });
      }

      function beginBotTurn(playerOneTurn) {
        let botPlayer = battleLobby.roster[(playerOneTurn) ? 0 : 1];
        let humanPlayer = battleLobby.roster[(playerOneTurn) ? 1 : 0];
        if (botPlayer.guarding) botPlayer.guarding = false; // make the bot stop guarding
        let turnAction;
        if (botPlayer.hp >= humanPlayer.hp) {
          if (botPlayer.mp < 20) turnAction = "attack";
          else turnAction = (Math.random() < 0.7) ? "magic" : "attack";
        }
        else {
          if (botPlayer.heals < 1) turnAction = "guard";
          else if (botPlayer.hp < 200) turnAction = "heal";
          else {
            if (Math.abs(botPlayer.hp - humanPlayer.hp) >= 400) {
              turnAction = (Math.random() < 0.8) ? "heal" : "guard";
            }
            else {
              if (botPlayer.mp < 20) turnAction = "attack";
              else turnAction = (Math.random() < 0.8) ? "magic" : "attack";
            }
          }
        }

        setTimeout(() => {
          bothPlayersStanding = performTurnAction(turnAction, botPlayer, humanPlayer, 1.25, 1.6);
          setTimeout(() => {
            if (bothPlayersStanding) return beginPlayerTurn(!playerOneTurn);
            else return endBattle();
          }, 2000);
        }, 1500);
      }

      function performTurnAction(action, currentPlayer, otherPlayer, atkMultiplier = 1, mgcMultiplier = 1) {
        /* Mr. Marshmallow uses a 1.5x and 2x multiplier on attack and magic respectively.
        Human players only get a 1.5x multiplier on magic attacks as they cost MP. */
        if (action == "a" || action == "attack" || action == "atk") {
          // attack. check if other player is defending.
          let atkDamage = Math.round(getRandomNumberFromRange(1, 200) * atkMultiplier);
          if (otherPlayer.guarding) atkDamage = guardDamage(atkDamage);
          let damageMessage = `• **${currentPlayer.user.username}** attacks!\n• ${getComment(atkDamage)}\n• ${atkDamage} HP of damage to **${otherPlayer.user.username}**!`;

          if (otherPlayer.hp - atkDamage <= 0) {
            otherPlayer.hp = 0;
            damageMessage = damageMessage.replace("damage", "mortal damage");
            damageMessage += `\n• **${otherPlayer.user.username}** got hurt and fell down...`;
          }
          else {
            otherPlayer.hp -= atkDamage;
            damageMessage += `\n• (**${otherPlayer.user.username}**'s HP is now ${otherPlayer.hp}/${maxHP}.)`;
          }
          message.channel.send(damageMessage);
        }
        else if (action == "m" || action == "magic" || action == "mgc") {
          // magic atk. lower mp by a certain amount, and check if user has no mp. like atk, check if other player is defending
          if (currentPlayer.mp < 20) {
            message.channel.send(`• **${currentPlayer.user.username}** tried a magic attack!\n• ...but nothing happened.\n• They realized they didn't have enough MP!`);
          }
          else {
            let mgcDamage = Math.round(getRandomNumberFromRange(10, 200) * mgcMultiplier);
            if (otherPlayer.guarding) mgcDamage = guardDamage(mgcDamage);
            let damageMessage = `• **${currentPlayer.user.username}** cast a magic attack!\n• ${getComment(mgcDamage)}\n• ${mgcDamage} HP of damage to **${otherPlayer.user.username}**!`;

            if (otherPlayer.hp - mgcDamage <= 0) {
              otherPlayer.hp = 0;
              damageMessage = damageMessage.replace("damage", "mortal damage");
              damageMessage += `\n• **${otherPlayer.user.username}** got hurt and fell down...`;
            }
            else {
              otherPlayer.hp -= mgcDamage;
              damageMessage += `\n• (**${otherPlayer.user.username}**'s HP is now ${otherPlayer.hp}/${maxHP}.)`;
            }
            message.channel.send(damageMessage);
            currentPlayer.mp -= 20;
          }
        }
        else if (action == "d" || action == "defend" || action == "def" || action == "guard") {
          // defend / guard (take only 40%-60% of atk damage this turn)
          currentPlayer.guarding = true;
          message.channel.send(`• **${currentPlayer.user.username}** is on guard.\n• (They will only take about 40-60% of any damage until their next turn.)`);
        }
        else if (action == "h" || action == "heal") {
          // heal
          if (currentPlayer.heals < 1) {
            message.channel.send(`• **${currentPlayer.user.username}** tried using a healing item!\n• ...but nothing happened.\n• They realized they ran out of heals!`);
          }
          else {
            let healHP = getRandomNumberFromRange(200, 350);
            let healMessage = `Recovered ${healHP} HP!`;
            if (healHP + currentPlayer.hp >= maxHP) {
              currentPlayer.hp = maxHP;
              healMessage = `HP has been maxed out!`;
            }
            else currentPlayer.hp += healHP;
            currentPlayer.heals -= 1;
            message.channel.send(`• **${currentPlayer.user.username}** used a healing item!\n• ${healMessage}\n• (**${currentPlayer.user.username}**'s HP is now ${currentPlayer.hp} and has ${currentPlayer.heals} healing item(s) left.)`);
          }
        }
        else if (action == "r" || action == "run") {
          // try running away. if successful, make currentPlayer's hp 0 to automatically end the game.
          let runMessage = `• **${currentPlayer.user.username}** tried to run away...`;
          if (Math.random() < 0.4) {
            message.channel.send(`${runMessage} and did!`);
            currentPlayer.hp = 0; // will always end the game
          }
          else message.channel.send(`${runMessage} but couldn't!`);
        }
        return (currentPlayer.hp > 0 && otherPlayer.hp > 0);
      }

      function endBattle() {
        let winner = battleLobby.roster[getPlayerIndexWithHp(battleLobby.roster)].user;
        message.channel.send(`• **${winner} WINS!**`);

        setTimeout(() => {
          let mentionedUser = (member.user == bot.user) ? "me" : `**${member.user.username}**`;
          message.channel.send(`${battleLobby.roster[0].user}, do you want to battle ${mentionedUser} again? (y/n)`)
          .then(() => {
            message.channel.awaitMessages(response => response.author.id == battleLobby.roster[0].user.id && promptActions.includes(response.content), { max: 1, time: 30000, errors: ["time"] })
            .then((collected) => {
              let res = collected.first().content.toLowerCase();
              if (res == "yes" || res == "y") {
                // reset all scores to zero
                battleLobby.roster.forEach(entry => {
                  entry.hp = maxHP;
                  entry.mp = maxMP;
                  entry.guarding = false;
                  entry.heals = maxHeals;
                });
                message.channel.send("OK, get ready, here we go!");
                return setTimeout(() => beginBattle(), 3000);
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
        bot.battleGames.delete(message.channel.id);
      }
    }
}

function getRandomNumberFromRange(min = 1, max = 200) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

function getComment(damage) {
  let comment = "";
  if (damage <= 25) comment = "Didn't look like it hurt...";
  else if (damage <= 75) comment = "Oh, buddy!";
  else if (damage <= 150) comment = "*WOWZA!*";
  else comment = "***SMAAAASH!!***";
  return comment;
}

function guardDamage(damage) {
  return Math.round(damage * (Math.random() * (0.6 - 0.4) + 0.4).toFixed(2));
}

function getPlayerIndexWithHp(roster) {
  let hpArray = [];
  roster.forEach(entry => hpArray.push(entry.hp));
  let indexes = [];
  hpArray.forEach((hpValue, index) => {
    if (hpValue > 0) indexes.push(index);
  });
  // at least one entry will be in the array
  return indexes;
}
