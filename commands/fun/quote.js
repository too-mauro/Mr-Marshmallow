/*
This command stores quotes submitted by users of a given server. Without an
argument, it will return a random stored quote, and with one, a user with the
`Manage Messages` permission can add, remove, list, export, purge the server's
quotes, or reset them to the defaults.
*/

const fs = require("fs");
const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const { purple_medium } = require("../../config/bot/colors.json");

module.exports = {
  config: {
      name: "quote",
      description: "Quote the best lines the server has to offer!",
      aliases: ["q"],
      usage: "(number) (add <quote>) (delete <number>) (list <number of quotes>) (export) (purge) (default)",
      category: "fun"
  },
  run: async (bot, message, args) => {
    const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`));
    const maxQuotes = serverConfig.maxQuotes;
    const quoteFile = `./config/server/${message.guild.id}/quotes.json`;
    const serverDenyList = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/denylist.json`, 'utf8'));

    if (args[0] && isNaN(args[0])) { args[0] = args[0].toLowerCase(); }
    switch (args[0]) {
      case 'add':
          if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to add a quote!`);
          }

          let newQuote = args.slice(1).join(" ").replace(/\n+/g, "\n");
          if (!newQuote) { return message.channel.send(`**${message.author.username}**, please enter something. You only get 500 characters, so make it count!`); }
          else if (newQuote.length > 500) {
            return message.channel.send(`Sorry **${message.author.username}**, your quote is too long!`);
          }
          fs.readFile(quoteFile, 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              let file = JSON.parse(data);
              if (file.quotes.length >= maxQuotes) {
                return message.channel.send(`Sorry **${message.author.username}**, I can only store up to ${maxQuotes} quotes. If you want to add another one, please delete an existing one.`);
              }
              file.quotes.push(newQuote);
              fs.writeFile(quoteFile, JSON.stringify(file, null, 1), 'utf8', (err) => {
                if (err) {
                  console.error(err);
                  return message.channel.send(`Sorry **${message.author.username}**, I couldn't store your quote!`);
                }
                else {
                  return message.channel.send(`**${message.author.username}**, your quote has been added! (This is now quote **#${file.quotes.length}**.)`);
                }
              });
            }
          });
          break;

      case 'delete':
          let pos = args.slice(1).join("");
          if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to delete a quote!`);
          }
          else if (!pos || isNaN(pos)) {
            return message.channel.send(`**${message.author.username}**, please enter the quote's number!`);
          }
          fs.readFile(quoteFile, 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              let cleanInt = Math.trunc(pos);
              let file = JSON.parse(data);
              if (file.quotes.length < 1) {
                return message.channel.send(`**${message.author.username}**, there are no quotes to delete!`);
              }
              else if (cleanInt > file.quotes.length || cleanInt <= 0) {
                return message.channel.send(`**${message.author.username}**, there's no quote at that position!`);
              }
              file.quotes.splice((cleanInt - 1), 1);
              fs.writeFile(quoteFile, JSON.stringify(file, null, 1), 'utf8', (err) => {
                if (err) {
                  console.error(err);
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
          if (!message.guild.me.hasPermission("EMBED_LINKS")) {
            return message.channel.send(`**${message.author.username}**, I need the \`Embed Links\` permission for this to work!`);
          }

          fs.readFile(quoteFile, 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              let pageLength = 6;  // <-- How many quotes will show on one page. Can be set up to 10 to anticipate large quotes and to respect embed character limit.
              if (args[1] && !isNaN(args[1]) && 0 < Math.trunc(args[1]) && Math.trunc(args[1]) <= 10) { pageLength = Math.trunc(args[1]); }
              let file = JSON.parse(data);
              if (file.quotes.length < 1) {
                return message.channel.send(`**${message.author.username}**, there are no quotes yet!`);
              }
              let pages = Math.round(file.quotes.length / pageLength);
              /* If the actual divided value is greater than the rounded one, truncate the decimals
              from the actual division, add 1, and use the resulting value. This ensures every quote will show up. */
              if ((file.quotes.length / pageLength) > pages) pages = Math.trunc(file.quotes.length / pageLength) + 1;
              let page = 1;
              let qPos = 0;

              let pLimit = Math.min(pageLength, file.quotes.length);
              const embed = new MessageEmbed()
                  .setColor(purple_medium)
                  .setAuthor(`${message.guild.name} Quotes`, message.guild.iconURL())
              for (qPos; qPos < pLimit; qPos++) {
                embed.addField(`**#${qPos + 1}**`, `${file.quotes[qPos]}`);
              }
              embed.setFooter(`Page ${page} / ${pages}  |  ${file.quotes.length} total ${file.quotes.length == 1 ? "quote" : "quotes"}`, bot.user.displayAvatarURL());
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
                        embed.addField(`**#${qPos + 1}**`, `${file.quotes[qPos]}`);
                      }
                    }
                    else if (page == pages) {
                      embed.fields = [];
                      qPos = pageLength * (pages - 1);
                      pLimit = Math.min(pageLength * pages, file.quotes.length);
                      for (qPos - pageLength; qPos < pLimit; qPos++) {
                        embed.addField(`**#${qPos + 1}**`, `${file.quotes[qPos]}`);
                      }
                    }
                    else {
                      embed.fields = [];
                      qPos = pageLength * (page - 1);
                      pLimit = Math.min(pageLength * page, file.quotes.length);
                      for (qPos - pageLength; qPos < pLimit; qPos++) {
                        embed.addField(`**#${qPos + 1}**`, `${file.quotes[qPos]}`);
                      }
                    }
                    embed.setFooter(`Page ${page} / ${pages}  |  ${file.quotes.length} total ${file.quotes.length == 1 ? "quote" : "quotes"}`, bot.user.displayAvatarURL());
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
                        embed.addField(`**#${qPos + 1}**`, `${file.quotes[qPos]}`);
                      }
                    }
                    else {
                      embed.fields = [];
                      pLimit = Math.min(pageLength * page, file.quotes.length);
                      for (qPos + pageLength; qPos < pLimit; qPos++) {
                        embed.addField(`**#${qPos + 1}**`, `${file.quotes[qPos]}`);
                      }
                    }
                    embed.setFooter(`Page ${page} / ${pages}  |  ${file.quotes.length} total ${file.quotes.length == 1 ? "quote" : "quotes"}`, bot.user.displayAvatarURL());
                    msg.edit(embed);
                  });

                });
              }
            }
          });
          break;

      case 'export':
          if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to export the quotes!`);
          }
          return message.channel.send(`**${message.author.username}**, here are the quotes for ${message.guild.name}!`,
            {
              files: [{
                attachment: quoteFile,
                name: `${message.guild.name}_quotes.json`
              }]
            });
          break;

      case 'import':
          if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to import quotes!`);
          }
          // check for file and if it's a JSON file
          let uploadedFile = message.attachments.first();
          if (!uploadedFile || uploadedFile.name.split(".")[1].toLowerCase() !== "json") {
            return message.channel.send(`**${message.author.username}**, please upload a JSON file with a "quotes" entry in it and write your quotes so they look like this:\n\`\`\`javascript\n{\n\t"quotes": [\n\t\t"\\"Quotes are fun to use!\\" -Lil Joey 2k20",\n\t\t"\\"Heck\nyeah!\\" -Honeystix 2k20"\n\t]\n}\`\`\``);
          }

          let download;
          try {
            download = await fetch(uploadedFile.url).then(res => res.json());
          }
          catch (err) {
            console.error(err);
            return message.channel.send(`**${message.author.username}**, I couldn't fetch your file! Please try again later.`);
          }

          if (!download.quotes || !Array.isArray(download.quotes)) {
            return message.channel.send(`**${message.author.username}**, please enter a "quotes" entry in your JSON file and write your quotes so they look like this:\n\`\`\`javascript\n{\n\t"quotes": [\n\t\t"\\"Quotes are fun to use!\\" -Lil Joey 2k20",\n\t\t"\\"Heck\nyeah!\\" -Honeystix 2k20"\n\t]\n}\`\`\``);
          }

          fs.readFile(quoteFile, "utf8", (err, data) => {
            if (err) {
              console.error(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            let file = JSON.parse(data);
            if (file.quotes.length >= maxQuotes) {
              return message.channel.send(`Sorry **${message.author.username}**, I can only store up to ${maxQuotes} quotes. If you want to add another one, please delete an existing one.`);
            }

            let addedQuotes = skippedQuotes = 0;
            for (let i = 0; i < download.quotes.length; i++) {
              // check if the current server's quote file hasn't met the max limit, then check against word filter (if enabled)
              if (file.quotes.length < maxQuotes) {
                if (serverConfig.wordfilter.enabled) {
                  let blocked = serverDenyList.wordfilter.filter(word => download.quotes[i].toLowerCase().replace(/ +|\n+/g, "").includes(word));
                  if (blocked.length > 0) {
                    skippedQuotes++;
                    continue;
                  }
                }
                try {
                  // replace with single spaces and only one newline character if any
                  file.quotes.push(download.quotes[i].replace(/ +/g, " ").replace(/\n+/g, "\n"));
                  addedQuotes++;
                }
                catch (err) {
                  console.error(err);
                  skippedQuotes++;
                }
              }
              else { skippedQuotes++; }
            }
            fs.writeFile(quoteFile, JSON.stringify(file, null, 1), 'utf8', (err) => {
              if (err) {
                console.error(err);
                return message.channel.send(`Sorry **${message.author.username}**, I couldn't import your quotes!`);
              }
              return message.channel.send(`**${message.author.username}**, ${addedQuotes} quote(s) imported / ${skippedQuotes} quote(s) skipped! (There are now **${file.quotes.length} quotes**.)`);
            });
          });
          break;

      case 'purge':
          if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to purge the quotes!`);
          }

          fs.readFile(quoteFile, 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              let file = JSON.parse(data);
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
                      fs.writeFile(quoteFile, JSON.stringify({quotes:[]}, null, 1), 'utf8', (err) => {
                        if (err) {
                          console.error(err);
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
          if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(`Sorry **${message.author.username}**, you need to have the \`Manage Messages\` permission to revert the quotes to their defaults!`);
          }

          fs.readFile(quoteFile, 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
            }
            else {
              let file = JSON.parse(data);
              message.channel.send(`**${message.author.username}**, are you *sure* you want to revert your quotes to the defaults? (y/n)`)
              .then(() => {
                message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y' || response.content === 'no' || response.content === 'n', {
                  max: 1,
                  time: 10000,
                  errors: ['time'],
                })
                .then((collected) => {
                  if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
                      fs.copyFile('./config/bot/defaults/quotes.json', quoteFile, (err) => {
                        if (err) {
                          console.error(err);
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
        fs.readFile(quoteFile, 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            return message.channel.send("Sorry, something went wrong while trying to read the quotes!");
          }

          let file = JSON.parse(data);
          if (file.quotes.length < 1) {
            return message.channel.send(`**${message.author.username}**, there are no quotes yet!`);
          }
          else if (!args || args.length < 1) {
            let rand = Math.floor(Math.random() * (Math.floor(file.quotes.length) - Math.ceil(1) + 1)) + Math.ceil(1);
            return message.channel.send(`> ${file.quotes[rand - 1].replace(/\n+/g, "\n> ")}`);
          }
          else if (!isNaN(args[0])) {
            let cleanInt = Math.trunc(args[0]);
            if (cleanInt > file.quotes.length || cleanInt <= 0) {
              return message.channel.send(`**${message.author.username}**, there is no quote at that position!`);
            }
            return message.channel.send(`> ${file.quotes[cleanInt - 1].replace(/\n+/g, "\n> ")}`);
          }
          else {
            return message.channel.send(`**${message.author.username}**, please enter the quote's number!`);
          }
        });
    }
  }
}
