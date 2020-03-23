/*
This command stores quotes submitted by users of a given server. Without an
argument, it will return a random stored quote, and with one, a user with the
`Manage Messages` permission can add, remove, export, or purge the server's quotes.
*/

const fs = require("fs");
const rl = require("readline");

module.exports = {
  config: {
      name: "quote",
      description: "Quotes, quotes, and more quotes!",
      aliases: ["q"],
      usage: ["list", " add <quote>", " <quote number>", " delete <quote number>"],
      category: "fun"
  },
  run: async (bot, message, args) => {

    var quoteFile = `./config/server/${message.guild.id}/quotes.txt`;
    var maxQuotes = JSON.parse(fs.readFileSync(`./config/server/${message.guild.id}/config.json`)).maxQuotes;

    // return a random quote if no arguments
    if (!args || args.length < 1) { return getQuote(quoteFile, "random", message.author); }

    else if (isNaN(args[0])) {
      var command = args[0];
      switch (command) {
        case 'add': return addQuote(quoteFile, args.slice(1).join(" "), message.author);

        case 'delete':
          return message.channel.send("This portion of the command isn't ready yet. Please, stay tuned!");
          var pos = args[1];
          if (isNaN(pos)) {
            return message.channel.send(`**${message.author.username}**, please enter the quote's number!`);
          }
          return deleteQuote(quoteFile, Math.trunc(pos), message.author); // might have to use a modified getQuote() function to get the line, then remove that line

        case 'list':
          return message.channel.send("This portion of the command isn't ready yet. Please, stay tuned!");  // use an embed message to show 10 messages at a time

        case 'export':
          if (fs.readFileSync(quoteFile) !== "") {
            return message.channel.send(`OK, **${message.author.username}**, here are the quotes for ${message.guild.name}.`, { files: [quoteFile] });
          }
          else { return message.channel.send("There are no quotes to export!"); }

        case 'purge': return purgeQuotes(quoteFile, message.author, message.guild);

        // static quotes (put here since they're not used as often)
        case 'joey': return message.channel.send("\"Someday I wish to be a slightly stronger marshmallow.\" -Lil Joey 2016");
        case 'net': return message.channel.send("\":clap:  ***L I S T E N***  :clap:\" -aneta_ 2017");
        case 'crispy': return message.channel.send("\"Shut your bitch ass up.\" -Crispy 2017");
        case 'xiv': return message.channel.send("*ahem* \"I\'m Asian.\" -xivee 2016");
        case 'jasse': return message.channel.send("\"I\'m a motorized yeen machine.\" -Jasse 2018");
        case 'fig': return message.channel.send("\"OK, quick! Where\'s the *dab* button?\" -FigTrees 2018");
        case 'bean': return message.channel.send("\"Holding hands is gay. Holding dicks is not.\" -smol_bean 2018");
      }
    }
    else {
      args[0] = Math.trunc(args[0]);  // in case the user gives a decimal, make it a whole number
      return getQuote(quoteFile, args[0], message.author);
    }


    function getQuote(quoteFile, pos, author) {
      if (fs.readFileSync(quoteFile, 'utf8') == "") { return message.channel.send(`**${author.username}**, there are no quotes yet!`); }
      let read = rl.createInterface({ input: fs.createReadStream(quoteFile) });
      let data = [];
      let totalLines = 0;
      read.on('line', function(line) {
          data.push(line);
          totalLines++;
      });
      read.on('close', function(line) {
        if (pos > totalLines || pos <= 0) { return message.channel.send(`There's no quote at that position, **${author.username}**!`); }
        else if (pos == "random") {
          return message.channel.send(data[(Math.floor(Math.random() * (Math.floor(totalLines) - Math.ceil(1) + 1) ) + Math.ceil(1)) - 1]);
        }
        else { return message.channel.send(data[pos - 1]); }
      });
      read.on('error', function(err) {
        console.log("Error: ", err);
        return message.channel.send("Whoops, looks like something went wrong while getting your quote. Sorry about that!");
      });
    }

    function addQuote(quoteFile, newQuote, author) {
      if (!message.guild.member(author).hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry **${author.username}**, you need to have the \`Manage Messages\` permission to add a quote!`);
      }

      let read = rl.createInterface({ input: fs.createReadStream(quoteFile) });
      let totalLines = 0;
      read.on('line', function(line) {
          totalLines++;
      });
      read.on('close', function(line) {
        console.log(`${message.guild.name} quote file lines: ${totalLines}`);
        if (newQuote == "") { return message.channel.send(`**${author.username}**, you need to enter something!`); }
        else if (totalLines >= maxQuotes) {
          return message.channel.send(`Sorry, **${author.username}**, I can't fit any more quotes for this server.`);
        }
        else if (newQuote.includes("\n") || newQuote.includes("\r")) {
          return message.channel.send(`Sorry **${author.username}**, your quote must be on one line!`);
        }
        fs.appendFile(quoteFile, `${newQuote}\n`, 'utf8', (err) => {
          if (err) {
            console.log(err);
            return message.channel.send(`Sorry **${author.username}**, I couldn't store your quote!`);
          }
        });
        return message.channel.send("Your quote has been added!");
      });
      read.on('error', function(err) {
        console.log("Error: ", err);
      });
    }

    function getLineCount(quoteFile) {

    }

    function deleteQuote(quoteFile, pos, author) {
      if (!message.guild.member(author).hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry **${author.username}**, you need to have the \`Manage Messages\` permission to delete a quote!`);
      }

      let read = rl.createInterface({ input: fs.createReadStream(quoteFile) });
      let data = fs.createWriteStream(quoteFile);
      let totalLines = 0;
      read.on('line', function(line) {
          totalLines++;
          if (pos == totalLines) { data.write("\n"); }
          else { data.write(`${line}\n`); }
      });
      read.on('close', function(line) {
        data.end();
        if (pos > totalLines || pos <= 0) { return message.channel.send(`There's no quote at that position, **${author.username}**!`); }
        else {
          return message.channel.send("The quote has been deleted!"); }
      });
      read.on('error', function(err) {
        console.log("Error: ", err);
        return message.channel.send("Whoops, looks like something went wrong. Sorry about that!");
      });
    }

    function purgeQuotes(quoteFile, author, guild) {
      if (!message.guild.member(author).hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(`Sorry **${author.username}**, you need to have the \`Manage Messages\` permission to purge the quotes!`);
      }
      message.channel.send(`**${author.username}**, are you *sure* you want to delete all of the server's quotes? (y/n)`)
      .then(() => {
        message.channel.awaitMessages(response => response.content === 'yes' || response.content === 'y' || response.content === 'no' || response.content === 'n', {
          max: 1,
          time: 10000,
          errors: ['time'],
        })
        .then((collected) => {
          if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
            try {
                fs.writeFile(quoteFile, "", (err) => {
                  if (err) {
                    console.log(err);
                    return message.channel.send("Whoops, something went wrong while deleting the quotes! Please try again later.");
                  }
                });
                return message.channel.send(`All of the quotes for ${guild.name} have been purged!`);
            }
            catch(e) { return message.channel.send(`Whoops, something went wrong! Here's the error: ${e.message}`); }
          }
          if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
            return message.channel.send("The operation\'s been cancelled.");
          }
          })
          .catch(() => {
            message.channel.send("Time's up!");
          });
      });
    }

  }
}
