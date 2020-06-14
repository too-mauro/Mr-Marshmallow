/*
This event fires every time a user leaves/is kicked from the server. This checks
if the DoorMat feature is on and has a channel set, and if both are true, sends
the leave message set in the server's configuration file.
*/

const fs = require("fs");

module.exports = async (bot, member) => {

    // check if the bot is the user being removed from the server
    if (member.user == bot.user) return;

    // get the server's current configurations
    const serverConfig = JSON.parse(fs.readFileSync(`./config/server/${member.guild.id}/config.json`, 'utf8'));

    // check if doormat is enabled for the server; if it's not, stop here
    if (!serverConfig.doormat.enabled) return;

    // check if there's a valid doormat channel, and if the channel is deleted, automatically reset the channel to null
    if (!serverConfig.doormat.channelID) return;
    let leaveChannel = member.guild.channels.cache.find(c => c.id === serverConfig.doormat.channelID);
    if (!leaveChannel) {
        serverConfig.doormat.channelID = null;
        return fs.writeFileSync(`./config/server/${member.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8');
    }

    // check if the message has username, servername, or both and replace them with a member mention or guild name
    let leaveMessage = serverConfig.doormat.leaveMessage;
    leaveMessage = leaveMessage.replace(/username/g, `**${member.user.tag}**`).replace(/servername/g, `**${member.guild.name}**`);

    try { leaveChannel.send(leaveMessage); }
    catch (e) { console.log(`Couldn't send the leave message in ${guild.name}!\n`, e); }
}
