module.exports = async bot => {
  console.log(`${bot.user.username} is online!`);
  bot.user.setStatus("online");
  bot.user.setPresence({
  game: {
    name: 'm!help',
    type: 'PLAYING'
   }
  })


  // Sends a message to a specific channel if desired. Insert the new channel ID after the get function.
  bot.channels.get('(bot logging channel ID here)').send("**Mr. Marshmallow v0.1** is ready to go!");

}
