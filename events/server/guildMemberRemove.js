const fs = require("fs");

module.exports = async (bot, member) => {

    // check if the bot is the user being removed from the server
    if (member.user == bot.user) return;

    // get the server's current configurations
    const configFile = require(`../../config/server/${member.guild.id}/config.json`);

    // check if doormat is enabled for the server; if it's not, stop here
    if (configFile.dmStatus == false) return;

    // check if there's a valid doormat channel, and if the channel is deleted, automatically turn it off and reset the channel to null
    if (configFile.dmChannel == null) return;
    let leaveChannel = member.guild.channels.cache.find(c => c.id === configFile.dmChannel);
    if (!leaveChannel) {
        configFile.dmStatus = false;
        configFile.dmChannel = null;
        fs.writeFile(`./config/server/${member.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
          if (err) console.log(err);
        });
        return console.log(`Doormat feature turned off and channel has been reset for ${member.guild.name} (ID: ${member.guild.id})`);
    }

    // check if the message has username, servername, or both and replace them with a member mention or guild name
    if (configFile.leaveMessage.includes('username')) {
      configFile.leaveMessage = configFile.leaveMessage.replace(/username/g, `**${member.user.tag}**`);
    }
    if (configFile.leaveMessage.includes('servername')) {
      configFile.leaveMessage = configFile.leaveMessage.replace(/servername/g, `**${member.guild.name}**`);
    }

    try {
      leaveChannel.send(configFile.leaveMessage);
    }
    catch (e) {
      console.log(`Error sending leave message in ${member.guild.name}: `, e);
    }

}
