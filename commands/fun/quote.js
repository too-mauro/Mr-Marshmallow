/*
This command stores quotes submitted by users of a given server. Without an
argument, it will return a random stored quote, and with one, a user with the
`Manage Messages` permission can add, remove, list, export, purge the server's
quotes, or reset them to the defaults.
*/

const fs = require("fs");
const rl = require("readline");
const discord = require("discord.js");
const { purple_medium } = require("../../config/bot/colors.json");

module.exports = {
  config: {
      name: "quote",
      description: "Quotes, quotes, and more quotes!",
      aliases: ["q"],
      usage: ["(number)", "add <quote>", "delete <number>", "list", "purge", "default"],
      category: "fun"
  },
  run: async (bot, message, args) => {

    const quoteJsonFile = `./config/server/${message.guild.id}/quotes.json`;
    const maxQuotes = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`)).maxQuotes;

    if (args[0] && isNaN(args[0])) { args[0] = args[0].toLowerCase(); }
    switch (args[0]) {
      case 'add':
          if (!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to add a quote!`);
          }

          let newQuote = args.slice(1).join(" ").replace(/\n+/g, "\n");
          if (!newQuote) { return message.channel.send(`**${message.author.username}**, please enter something. You only get 500 characters, so make it count!`); }
          else if (newQuote.length > 500) {
            return message.channel.send(`Sorry **${message.author.username}**, your quote is too long!`);
          }
          fs.readFile(quoteJsonFile, 'utf8', (err, data) => {
            if (err) {
              console.log(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              var file = JSON.parse(data);
              if (file.quotes.length >= maxQuotes) {
                return message.channel.send(`Sorry **${message.author.username}**, I can only store up to ${maxQuotes} quotes. If you want to add a quote, please delete another one.`);
              }
              file.quotes.push({"m": newQuote});
              fs.writeFile(quoteJsonFile, JSON.stringify(file), 'utf8', (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send(`Sorry **${message.author.username}**, I couldn't store your quote!`);
                }
                else {
                  return message.channel.send(`**${message.author.username}**, your quote has been added!`);
                }
              });
            }
          });
          break;

      case 'delete':
          var pos = args.slice(1).join("");
          if (!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to delete a quote!`);
          }
          else if (!pos || isNaN(pos)) {
            return message.channel.send(`**${message.author.username}**, please enter the quote's number!`);
          }
          fs.readFile(quoteJsonFile, 'utf8', (err, data) => {
            if (err) {
              console.log(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              var cleanInt = Math.trunc(pos);
              var file = JSON.parse(data);
              if (file.quotes.length < 1) {
                return message.channel.send(`**${message.author.username}**, there are no quotes to delete!`);
              }
              else if (cleanInt > file.quotes.length || cleanInt <= 0) {
                return message.channel.send(`**${message.author.username}**, there's no quote at that position!`);
              }
              file.quotes.splice((cleanInt - 1), 1);
              fs.writeFile(quoteJsonFile, JSON.stringify(file), 'utf8', (err) => {
                if (err) {
                  console.log(err);
                  return message.channel.send(`Sorry **${message.author.username}**, I couldn't delete your quote!`);
                }
                else {
                  return message.channel.send(`**${message.author.username}**, your quote has been deleted!`);
                }
              });
            }
          });
          break;

      case 'list':
          if (!message.guild.member(bot.user).hasPermission("EMBED_LINKS")) {
            return message.channel.send(`**${message.author.username}**, I need the \`Embed Links\` permission for this to work!`);
          }

          fs.readFile(quoteJsonFile, 'utf8', (err, data) => {
            if (err) {
              console.log(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              let pageLength = 6;   // <-- How many quotes will show on one page. Can be set up to 25 due to message embed restrictions.
              var file = JSON.parse(data);
              if (file.quotes.length < 1) {
                return message.channel.send(`**${message.author.username}**, there are no quotes yet!`);
              }
              let pages = Math.round(file.quotes.length / pageLength);
              // If the actual divided value is greater than the rounded one, truncate the decimals
              // from the actual division, add 1, and use the resulting value. This ensures every quote will show up.
              if ((file.quotes.length / pageLength) > pages) { pages = Math.trunc(file.quotes.length / pageLength) + 1; }
              let page = 1;
              let qPos = 0;

              var pLimit = Math.min(pageLength, file.quotes.length);
              const embed = new discord.MessageEmbed()
                  .setColor(purple_medium)
                  .setAuthor(`${message.guild.name} Quotes`, message.guild.iconURL())
              for (qPos; qPos < pLimit; qPos++) {
                embed.addField(`**Quote #${qPos + 1}**`, `${file.quotes[qPos].m}`);
              }
              embed.setFooter(`Page ${page} of ${pages}  |  Total Quotes: ${file.quotes.length}`, bot.user.displayAvatarURL());
              if (file.quotes.length <= pageLength) { return message.channel.send({embed}); }
              else {
                message.channel.send({embed}).then(msg => {
                  msg.react("⬅").then(() => msg.react('➡'));
                  const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id;
                  const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id;

                  const backwards = msg.createReactionCollector(backwardsFilter, {timer: 6000});
                  const forwards = msg.createReactionCollector(forwardsFilter, {timer: 6000});

                  backwards.on('collect', r => {
                    if (page === 1) { page = pages; }
                    else { page--; }
                    if (page == 1) {
                      embed.fields = [];
                      qPos = 0;
                      pLimit = Math.min(pageLength, file.quotes.length);
                      for (qPos; qPos < pLimit; qPos++) {
                        embed.addField(`**Quote #${qPos + 1}**`, `${file.quotes[qPos].m}`);
                      }
                    }
                    else if (page == pages) {
                      embed.fields = [];
                      qPos = pageLength * (pages - 1);
                      pLimit = Math.min(pageLength * pages, file.quotes.length);
                      for (qPos - pageLength; qPos < pLimit; qPos++) {
                        embed.addField(`**Quote #${qPos + 1}**`, `${file.quotes[qPos].m}`);
                      }
                    }
                    else {
                      embed.fields = [];
                      qPos = pageLength * (page - 1);
                      pLimit = Math.min(pageLength * page, file.quotes.length);
                      for (qPos - pageLength; qPos < pLimit; qPos++) {
                        embed.addField(`**Quote #${qPos + 1}**`, `${file.quotes[qPos].m}`);
                      }
                    }
                    embed.setFooter(`Page ${page} of ${pages}  |  Total Quotes: ${file.quotes.length}`, bot.user.displayAvatarURL());
                    msg.edit(embed);
                  });

                  forwards.on('collect', r => {
                    if (page === pages) { page = 1; }
                    else { page++; }
                    if (page == 1) {
                      embed.fields = [];
                      qPos = 0;
                      pLimit = Math.min(pageLength, file.quotes.length);
                      for (qPos; qPos < pLimit; qPos++) {
                        embed.addField(`**Quote #${qPos + 1}**`, `${file.quotes[qPos].m}`);
                      }
                    }
                    else {
                      embed.fields = [];
                      pLimit = Math.min(pageLength * page, file.quotes.length);
                      for (qPos + pageLength; qPos < pLimit; qPos++) {
                        embed.addField(`**Quote #${qPos + 1}**`, `${file.quotes[qPos].m}`);
                      }
                    }
                    embed.setFooter(`Page ${page} of ${pages}  |  Total Quotes: ${file.quotes.length}`, bot.user.displayAvatarURL());
                    msg.edit(embed);
                  });

                });
              }
            }
          });
          break;

      /*
      case 'export':
          fs.readFile(quoteJsonFile, 'utf8', (err, data) => {
            if (err) {
              console.log(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              var file = JSON.parse(data);
              if (file.quotes.length < 1) {
                return message.channel.send(`**${message.author.username}**, there are no quotes to export!`);
              }
              else {
                if (fs.existsSync(`./config/server/${message.guild.id}/quotes.txt`)) {
                  for (let m = 0; m < file.quotes.length; m++) {
                    fs.appendFile(`./config/server/${message.guild.id}/quotes.txt`, `${file.quotes[m].m}\n`, 'utf8', (err) => {
                      if (err) throw err;
                    });
                  }
                  message.channel.send(`OK, **${message.author.username}**, here are the quotes for ${message.guild.name}:`, { files: [`./config/server/${message.guild.id}/quotes.txt`] });
                  fs.unlinkSync(`./config/server/${message.guild.id}/quotes.txt`);
                }
              }
            }
          });
          break;
      */

      case 'purge':
          if (!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to purge the quotes!`);
          }

          fs.readFile(quoteJsonFile, 'utf8', (err, data) => {
            if (err) {
              console.log(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              var file = JSON.parse(data);
              if (file.quotes.length < 1) {
                return message.channel.send(`**${message.author.username}**, there are no quotes to purge!`);
              }
              message.channel.send(`**${message.author.username}**, are you *sure* you want to delete all of ${message.guild.name}'s quotes? (y/n)`)
              .then(() => {
                message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y' || response.content === 'no' || response.content === 'n', {
                  max: 1,
                  time: 10000,
                  errors: ['time'],
                })
                .then((collected) => {
                  if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
                      fs.writeFile(quoteJsonFile, JSON.stringify( { quotes: [] } ), 'utf8', (err) => {
                        if (err) {
                          console.log(err);
                          return message.channel.send("Something went wrong while trying to purge the server's quotes!");
                        }
                        return message.channel.send(`All of ${message.guild.name}'s quotes have been purged!`);
                      });
                  }
                  if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
                    return message.channel.send("The operation's been cancelled.");
                  }
                })
                .catch(() => {
                  message.channel.send("Time's up!");
                });
              });
            }
          });
          break;

      case 'default':
          if (!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to revert the quotes to their defaults!`);
          }

          fs.readFile(quoteJsonFile, 'utf8', (err, data) => {
            if (err) {
              console.log(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              var file = JSON.parse(data);
              message.channel.send(`**${message.author.username}**, are you *sure* you want to revert your quotes to the defaults? (y/n)`)
              .then(() => {
                message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y' || response.content === 'no' || response.content === 'n', {
                  max: 1,
                  time: 10000,
                  errors: ['time'],
                })
                .then((collected) => {
                  if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
                      fs.copyFile('./config/bot/defaultquotes.json', quoteJsonFile, (err) => {
                        if (err) {
                          console.log(err);
                          return message.channel.send("Something went wrong while trying to reset the server's quotes to their defaults!");
                        }
                        return message.channel.send(`All of ${message.guild.name}'s quotes have been reset!`);
                      });
                  }
                  if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
                    return message.channel.send("The operation's been cancelled.");
                  }
                })
                .catch(() => {
                  message.channel.send("Time's up!");
                });
              });
            }
          });
          break;

      default:
          if (!args || args.length < 1) {
            fs.readFile(quoteJsonFile, 'utf8', (err, data) => {
              if (err) {
                console.log(err);
                return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
              }
              else {
                var file = JSON.parse(data);
                if (file.quotes.length < 1) {
                  return message.channel.send(`**${message.author.username}**, there are no quotes yet!`);
                }
                return message.channel.send(file.quotes[(Math.floor(Math.random() * (Math.floor(file.quotes.length) - Math.ceil(1) + 1) ) + Math.ceil(1)) - 1].m);
              }
            });
          }
          else if (!isNaN(args[0])) {
            var cleanInt = Math.trunc(args[0]);
            fs.readFile(quoteJsonFile, 'utf8', (err, data) => {
              if (err) {
                console.log(err);
                return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
              }
              else {
                var file = JSON.parse(data);
                if (file.quotes.length < 1) {
                  return message.channel.send(`**${message.author.username}**, there are no quotes yet!`);
                }
                else if (cleanInt > file.quotes.length || cleanInt <= 0) {
                  return message.channel.send(`**${message.author.username}**, there is no quote at that position!`);
                }
                return message.channel.send(file.quotes[cleanInt - 1].m);
              }
            });
          }
          else {
            return message.channel.send(`**${message.author.username}**, please enter the quote's number!`);
          }
    }

  }
}
