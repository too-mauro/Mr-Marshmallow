/*
This file loads all the events found in the /events directory into memory.
There are multiple sub-directories, so it goes through each one and
adds all the event files within said directories into memory.
*/

const {readdirSync, statSync} = require("fs");

module.exports = (bot) => {
  try {
    readdirSync("./events/").forEach(dir => {
      if (statSync(`./events/${dir}/`).isDirectory()) {
        let events = readdirSync(`./events/${dir}`).filter(d => d.endsWith(".js"));
        for (let file of events) {
            const evt = require(`../events/${dir}/${file}`);
            let eName = file.split(".")[0];
            bot.on(eName, evt.bind(null, bot));
            delete require.cache[require.resolve(`../events/${dir}/${file}`)];
        }
      }
    });
  }
  catch (err) {
    // print out error and kill the server; it won't work properly if the events weren't bound
    console.error("Failed to bind all of the events!\n", err);
    if (bot) bot.destroy();
    process.exit(1);
  }
}
