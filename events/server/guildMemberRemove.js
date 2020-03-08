const fs = require("fs");

module.exports = async (member) => {

    // check if the bot is removed from the server first
    if (member.guild.deleted) return;

    // get the server's current configurations
    const configFile = require(`../../config/server/${member.guild.id}/config.json`);

    // check if doormat is enabled for the server; if it's not, stop here
    if (configFile.dmStatus == false) return;

    // check if there's a valid doormat channel, and if the channel is deleted, automatically turn it off and reset the channel to null
    if (configFile.dmChannel == null) return;
    if (member.guild.channels.get(configFile.dmChannel).deleted) {
        configFile.dmStatus = false;
        configFile.dmChannel = null;
        fs.writeFile(`./config/server/${member.guild.id}/config.json`, JSON.stringify(configFile, null, 1), (err) => {
          if (err) console.log(err);
        });
        return console.log(`Doormat feature turned off and channel has been reset for ${member.guild.name} (ID: ${member.guild.id})`);
    }

    // check if the message has username, servername, or both and replace them with a member mention or guild name
    if (configFile.leaveMessage.includes('username')) {
      configFile.leaveMessage = configFile.leaveMessage.replace("/username/g", `**${member.tag}**`);
    }
    else if (configFile.leaveMessage.includes('servername')) {
      configFile.leaveMessage = configFile.leaveMessage.replace("/servername/g", `**${member.guild.name}**`);
    }

    try {
      member.guild.channels.get(configFile.dmChannel).send(configFile.leaveMessage);
    } catch (e) {
      console.log(`Error sending leave message in ${member.guild.name}: `, e);
    }

}
