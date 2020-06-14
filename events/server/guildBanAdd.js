/*
This event fires every time a user is banned from the server. This checks if the
DoorMat feature is on and has a channel set, and if both are true, sends the
leave message set in the server's configuration file.
*/

const fs = require("fs");

module.exports = async (bot, guild, user) => {

  // check if the bot is the user being banned from the server
  if (user == bot.user) return;

  // get the server's current configurations
  const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${guild.id}/config.json`, 'utf8'));

  // check if doormat is enabled for the server; if it's not, stop here
  if (!serverConfig.doormat.enabled) return;

  // check if there's a valid doormat channel, and if the channel is deleted, automatically reset the channel to null
  if (!serverConfig.doormat.channelID) return;
  let banChannel = guild.channels.cache.find(c => c.id === serverConfig.doormat.channelID);
  if (!banChannel) {
      serverConfig.doormat.channelID = null;
      return fs.writeFileSync(`./config/server/${guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8');
  }

  // check if the message has username, servername, or both and replace them with a member mention or guild name
  let banMessage = serverConfig.doormat.banMessage;
  banMessage = banMessage.replace(/username/g, `**${user.tag}**`).replace(/servername/g, `**${guild.name}**`);

  try { banChannel.send(banMessage); }
  catch (e) { console.log(`Couldn't send the ban message in ${guild.name}!\n`, e); }
}
