# Mr. Marshmallow
A simple Discord bot!

### A Few Things to Note
- By default, the bot's prefix is set to be `m!`. If you want to change it, change the prefix line in the `botsettings.json` file. The option to change the prefix per-server is not implemented at this time and will come in the future.
- The token and owner ID lines have placeholders in the `botsettings.json` file. You would need to change those before you start the bot.
- There's a channel placeholder in the `/events/client/ready.js` file. Once the bot starts, it sends a message to a user-defined Discord channel stating it's online and ready to go. If you don't want that feature, either comment the line out or delete it.

### Getting Started
To get started using this bot's code, you'll need to install a few packages. This runs on the Discord.js and Node.js frameworks, so installing these two packages is a must.
Assuming Node.js is already installed, go to the directory where the code is located and enter this into a terminal:

`npm install discord.js enmap erlpack node-fetch better-sqlite-pool --save`

Once it installs, type in the following command:

`node index.js`, 

which will start the bot, send a message that it's online in the terminal, and will send a message to the Discord channel of your choice (see note above).
