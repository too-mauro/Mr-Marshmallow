<div align="center">
  <img src="https://user-images.githubusercontent.com/49416852/115483192-509b3680-a21e-11eb-9504-93c8845379df.png" title="Mr. Marshmallow" alt="Mr. Marshmallow" width="300" height="200">

  # Mr. Marshmallow

  A happy li'l marshmallow-based, general purpose Discord bot! A sweet boy who can help spice up your server.
  If you like or enjoy this repository, please feel free to leave a star ⭐ to help promote Mr. Marshmallow!

  Looking for support or a place to hang out? Come join the [Rockin' Treehouse](https://discord.com/invite/UA6tK26)!
<hr>

  [Features](#Features) • [Installation & Setup](#Installation--Setup) • [License](#License) • [Acknowledgements](#Acknowledgements)

</div>
<hr>

## Features
- Welcome new people to your server or wish them happy trails!
- Pin your server's best posts!
- Jam out to some music!
- Quote your friends!
- Play a game of trivia against other server members!
- Roll for a 6, a 12, a D20, or a D100!
- Dab on someone!
- Battle other server members in turn-based combat!

## Installation & Setup
Mr. Marshmallow has been made to run (mostly) out of the box! There are a few steps you need to follow for this to work properly.

This project runs on top of Node.js, so you will need to install version 14 or higher (refer to the [Node.js website](https://nodejs.org/en/) for help installing).

Once Node.js is installed, clone or download this repository. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new bot user. You will receive a token that you will need to run this bot. Go to the directory where you downloaded this repository and create a new file called `.env` in the same location as `server.js`. In it, enter your token using the following structure:
```
TOKEN='<your-token-here>'
```
Save the file and close it. From there, open a terminal/command prompt window, and type `node server.js`, which will run Mr. Marshmallow!

### Getting Music Functionality to Work
Starting with v0.9, Mr. Marshmallow requires the use of the "ffmpeg" application for the music commands to function properly. If you plan to use these commands, install this application.

### Keeping the Bot Online
PM2, a Node.js process manager, is recommended to keep Mr. Marshmallow up and running. In the case of an unexpected shutdown, it will be able to get right back up when your system starts! Please refer to [this guide](https://discordjs.guide/improving-dev-environment/pm2.html#installation) on how to set up PM2.

## License
Mr. Marshmallow is currently released under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html) license.

## Acknowledgements
A special thanks to these people for making this project possible!

- [An Idiot's Guide](https://github.com/AnIdiotsGuide/discordjs-bot-guide) & [MenuDocs](https://github.com/MenuDocs/Discord.js-v12-Tutorials): Mr. Marshmallow's command & event handler
- [Open Trivia Database](https://opentdb.com/): trivia questions for the `trivia` command
- [Official Joke API](https://github.com/15Dkatz/official_joke_api): joke API for the `joke` command
- [Astrology.com](https://astrology.com) & [Amanda Y. Huang](https://ohmanda.com/): horoscopes & API for `horoscope` command, respectively
