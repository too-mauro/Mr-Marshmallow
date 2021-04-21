/*
This file loads all the commands found in the /commands directory into memory.
There are multiple sub-directories, so it goes through each one and
adds all the command files within said directories into memory.
*/

const {readdirSync, statSync} = require("fs");

module.exports = (bot) => {
  try {
    readdirSync("./commands/").forEach(dir => {
      if (statSync(`./commands/${dir}/`).isDirectory()) {
        let commandList = readdirSync(`./commands/${dir}/`).filter(d => d.endsWith(".js"));
        for (let file of commandList) {
            let command = require(`../commands/${dir}/${file}`);
            bot.commands.set(command.config.name, command);
            if (command.config.aliases) {
              command.config.aliases.forEach(alias => {
                bot.aliases.set(alias, command.config.name);
              });
            }
            delete require.cache[require.resolve(`../commands/${dir}/${file}`)];
        }
      }
    });
  }
  catch (err) {
    // print out error and kill the server; it won't work properly if the commands weren't loaded
    console.error("Failed to load the commands!\n", err);
    if (bot) bot.destroy();
    process.exit(1);
  }
}
