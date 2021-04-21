/* This event fires every time a user leaves (user left by themselves, is kicked,
or banned) from the server. This checks if the DoorMat feature is on and has a
channel set, and if both are true, checks if the user was banned. If so, this
sends the ban message; otherwise, it sends the leave message set in the server's
configuration file. */

const {readFileSync, writeFileSync} = require("fs");

module.exports = async (bot, member) => {

    // check if the bot is the user being removed from the server
    if (member.user == bot.user) return;

    // get the server's current configurations
    const serverConfig = JSON.parse(readFileSync(`./config/server/${member.guild.id}/config.json`, 'utf8'));

    // check if doormat is enabled for the server; if it's not, stop here
    if (!serverConfig.doormat.enabled) return;

    // check if there's a valid doormat channel, and if the channel is deleted, automatically reset the channel to null
    if (!serverConfig.doormat.channelID) return;
    let leaveChannel = member.guild.channels.cache.find(c => c.id === serverConfig.doormat.channelID);
    if (!leaveChannel) {
        serverConfig.doormat.channelID = null;
        return writeFileSync(`./config/server/${member.guild.id}/config.json`, JSON.stringify(serverConfig, null, 1), 'utf8');
    }

    /* Try to find the user in the ban logs if the bot has the "Ban Members" permission. If it doesn't or can't find the user,
    send the standard message. */
    if (member.guild.me.hasPermission("BAN_MEMBERS")) {
      const banList = await member.guild.fetchBans();
      if (banList.map(b => b).some(log => log.user == member.user)) {
        /* If the user was found in the ban logs, send the ban message from the config file.
        Replace all 'username' and 'servername' references with member tag and server name, respectively. */
        let banMessage = serverConfig.doormat.banMessage;
        banMessage = banMessage.replace(/<user>/g, `**${member.user.tag}**`).replace(/<server>/g, `**${member.guild.name}**`);

        try {
          if (member.guild.me.permissionsIn(leaveChannel).has("SEND_MESSAGES")) {
            leaveChannel.send(banMessage);
          }
        }
        catch (err) {
          console.error(`Couldn't send the ban message in ${guild.name}!\n`, err);
        }
        return;
      }
    }

    /* If the bot doesn't have the "Ban Members" permission or didn't find the user in the ban logs, just send the standard
    leave message from the config file. Replace all 'username' and 'servername' references with member tag and server name,
    respectively. */
    let leaveMessage = serverConfig.doormat.leaveMessage;
    leaveMessage = leaveMessage.replace(/<user>/g, `**${member.user.tag}**`).replace(/<server>/g, `**${member.guild.name}**`);

    try {
      if (member.guild.me.permissionsIn(leaveChannel).has("SEND_MESSAGES")) {
        leaveChannel.send(leaveMessage);
      }
    }
    catch (err) {
      console.error(`Couldn't send the leave message in ${guild.name}!\n`, err);
    }
}
