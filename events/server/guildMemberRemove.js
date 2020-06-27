/* This event fires every time a user leaves (user left by themselves, is kicked,
or banned) from the server. This checks if the DoorMat feature is on and has a
channel set, and if both are true, checks if the user was banned. If so, this
sends the ban message; otherwise, it sends the leave message set in the server's
configuration file. */

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

    /* check if the user was banned (get the most recent ban info from the audit logs and check the member's ID against it)
    if the bot doesn't have the "Ban Members" permission, send the standard message */
    let userBanned = false;
    if (member.guild.me.hasPermission("BAN_MEMBERS")) {
      const banList = await member.guild.fetchBans();
      userBanned = banList.map(b => b).some(log => log.user == member.user);
    }
    if (userBanned) {
      /* if the user was banned, send the ban message from the config file
      check if the message has username, servername, or both and replace them with a member mention or guild name */
      let banMessage = serverConfig.doormat.banMessage;
      banMessage = banMessage.replace(/username/g, `**${member.user.tag}**`).replace(/servername/g, `**${member.guild.name}**`);

      try { leaveChannel.send(banMessage); }
      catch (e) { console.log(`Couldn't send the ban message in ${guild.name}!\n`, e); }
    }
    else {
      /* otherwise, just send the standard leave message from the config file
      check if the message has username, servername, or both and replace them with a member mention or guild name */
      let leaveMessage = serverConfig.doormat.leaveMessage;
      leaveMessage = leaveMessage.replace(/username/g, `**${member.user.tag}**`).replace(/servername/g, `**${member.guild.name}**`);

      try { leaveChannel.send(leaveMessage); }
      catch (e) { console.log(`Couldn't send the leave message in ${guild.name}!\n`, e); }
    }
}
