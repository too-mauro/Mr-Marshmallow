/*
This event fires every time a user joins the server. This checks if the DoorMat
feature is on and has a channel set, and if both are true, sends the welcome
message set in the server's configuration file.
*/

const fs = require("fs");

module.exports = async (bot, member) => {

    // check if the bot is the user joining the server
    if (member.user == bot.user) return;

    // get the server's current configurations
    const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${member.guild.id}/config.json`, 'utf8'));

    // check if doormat is enabled for the server; if it's not, stop here
    if (!serverConfig.doormat.enabled) return;

    // check if there's a valid doormat channel, and if the channel doesn't exist, automatically reset the channel to null
    if (!serverConfig.doormat.channelID) return;
    let welcomeChannel = member.guild.channels.cache.find(c => c.id === serverConfig.doormat.channelID);
    if (!welcomeChannel) {
        serverConfig.doormat.channelID = null;
        return fs.writeFileSync(`./config/server/${member.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8');
    }

    // check if the message has membername, servername, or both and replace them with a member mention or guild name
    let welcomeMessage = serverConfig.doormat.welcomeMessage;
    welcomeMessage = welcomeMessage.replace(/username/g, member.user).replace(/servername/g, `**${member.guild.name}**`);

    try { welcomeChannel.send(welcomeMessage); }
    catch (e) { console.log(`Couldn't send the welcome message in ${guild.name}!\n`, e); }
}
