# Mr. Marshmallow Change Log
This document serves as the complete change log for Mr. Marshmallow's development. All versions listed here record the changes that have occurred between versions uploaded to this repository.

## v0.10.1.4
### Minor Updates
- Fixed an arbitrary file creation/overwrite and arbitrary code execution security vulnerability in `tar` package
- Updated packages:
  - Discord.js audio package (`@discordjs/opus`) now at v0.6.0
  - `ytdl-core` updated to v4.9.1
  - `ytpl` updated to v2.2.3
  - `yt-search` updated to v2.10.1

## v0.10.1.3
### Minor Updates
- Fixed a Denial of Service security vulnerability with `css-what` package (`yt-search` dependency)
- Updated packages:
  - Discord.js audio package (`@discordjs/opus`) now at v0.5.3
  - `ytdl-core` updated to v4.8.3

## v0.10.1.2 (Hotfix)
### Minor Updates
- Updated packages:
  - `dotenv` now at v10
  - `ytdl-core` now at v4.8.2
- Fixed a security vulnerability with websocket package via update

## v0.10.1.1 (Hotfix)
### Bug-fixes
- Fixed another issue with the `skip` command and the voting system

## v0.10.1
### Major Updates
- Bot now expects token to be stored as "DISCORD_TOKEN" variable in .env file
- Searching for songs in `play` will return five choices to pick instead of getting the first result automatically

### Minor Updates
- "Now playing" messages now show the video's channel name (with a link if embeds are enabled)
- `mock` command no longer counts spaces and symbols as part of characters to capitalize
- Videos queued for playing now use the best audio quality available for each video instead of using specific itag values
- `pause` takes a bit longer to pause a given song/stream and may need to be run twice to work properly
  - This may be an issue with the Discord.js library and this command was modified to work as reliably as possible
- Minor code tweaks
- Package updates
  - `dotenv` upgraded to v9.0.2
  - `ytdl-core` upgraded to v4.8
  - `ytpl` upgraded to v2.2.1

### Bug-fixes
- Battle turn starts correctly for the bot if player waits too long to choose


## v0.10.0.1 (Hotfix 1)
### Bug-fixes
- Fixed an issue with the `skip` command not working

## v0.10
### Major Updates
- Game updates
  - `riddle` command has been removed, could not be implemented
  - Quality-of-life `trivia` updates
    - Multiple winners are now shown in the event of a tie (instead of just one)
    - Trivia can now be played on multiple servers simultaneously
    - New Challenge Mode! Each wrong answer subtracts the question's point count
    - Trivia hosts now have the option to play a new game with the same roster/settings after a game ends
    - Solo games can be started instantly with `trivia start` without having to create a lobby first
  - New `games` command to handle settings for game commands, including default Challenge Mode setting
- Music command updates
  - Users can now vote to skip a currently playing song! Enable it in the new `vote` setting in the `music` command
    - Song skip voting does not occur if there is only one person in a voice channel when enabled
  - `skip` now skips the currently playing song if it's the only song in queue
  - Now possible to remove multiple songs from the music queue at once
  - `repeat` command now repeats the current song by default
- New commands
  - New `chain` game! Repeat a word or phrase as many times as you can in one minute!
  - New `battle` game! Go against another server member in a turn-based RPG battle!
  - `mock` command: NoW YoU CaN UsE TeXt lIkE ThIs!
  - `horoscope` command: get daily horoscopes based on your star sign!
- Other/Misc.
  - `dab` now rates your dab from 1-10, where 10 is very stylish
  - Configuration settings now automatically generated for servers that added the bot while offline at startup
  - Now possible to load, unload, or reload multiple bot commands at once
  - Changed "**username**" and "**servername**" variables in settings commands to **<user>** and **<server>** respectively
  - New **<rules>** variable added to mention server's rules channel in welcome message (if server has one set)

### Minor Updates
- Updated and unified word checker function, now part of the bot's "util" file
- Shortened time for reactions to register changing pages when viewing a server's music queue (6 mins to 3 mins)
- Moved playlist "Last updated" text to the embed's footer (or bottom of message if embeds are disabled)
- Added more information to "added to queue" messages for songs and playlists
- Welcome, leave, and ban messages now previewed in `doormat` command when using `welcome`, `leave`, or `ban` arguments respectively
- Updated response message for `roll` command
- Updated text in the settings commands and removed redundant text
- Updated emotes within certain commands (`8ball`, `dab`, etc.)
- Updated bot's startup message variable from "vX" to **<version>**
- Bot now gets destroyed before quitting server in `shutdown` command
- Package updates
  - `discord.js` upgraded to v12.5.3
  - `@discordjs/opus` upgraded to v0.5
  - `ffmpeg-static` upgraded to v4.3
  - `yt-search` upgraded to v2.8
  - `ytpl` upgraded to v2.1.1
  - `ytdl-core` upgraded to v4.5
  - `graceful-fs` package removed (went unused)

### Bug-fixes
- Changed reaction filter to allow anyone to change quote and music queue pages in `quote` and `queue` commands respectively
- Fixed the restricted word filter to delete messages with whole-word restricted words (instead of partial word filtering)

## v0.9.5
### Minor Updates
- Added when a playlist was last updated when added to the queue
- Implemented a switch to use different audio quality for live/pre-recorded videos
- Updated a few dependency packages
  - `@discordjs/opus` upgraded to v0.4.0
  - `graceful-fs` upgraded to v4.2.6
  - `yt-search` upgraded to v2.7.3
  - `ytdl-core` upgraded to v4.4.5
  - `ytpl` upgraded to v2.0.5
### Bug-fixes
- Fixed a "No such format found: 95" error while trying to play non-live songs
- Fixed an issue with displaying song count when loading a playlist

## v0.9.4
### Major Updates
- Quote importing fully works! JSON files can be used to import.
  - Must upload a file with a `"quotes"` entry when calling the command, how-to will show if no or non-JSON file found
  - Importing will check each quote against the server's restricted word list, if enabled
  - Will add until the end of the `"quotes"` entry or the server's maximum quote limit is reached, whichever comes first
### Minor Updates
- `ytdl-core` package updated to v4.4.2
- `ytpl` package updated to v2.0.4
- Multi-line quotes now show as a whole quote block instead of just the first line
- `changelog` command uses a shorter link to redirect to this repository's change log

## v0.9.3
### Major Updates
- `resume` command removed, functionality merged into `pause` command
### Minor Updates
- Music commands can now handle live videos properly
  - Live videos show up as "LIVE" in now playing messages and queue
- Discord.js updated to v12.5.1
- `yt-search` package updated to v2.5.1
- `ytdl-core` package updated to v4.1.4
- `ytpl` package updated to v2.0.0-alpha.3
### Bug-fixes
- Fixed the `remove` command so removing the first queue entry doesn't remove the currently playing song
- Fixed a bug where playlists wouldn't work properly, bug caused from YouTube API change

## v0.9.2
### Minor Updates
- `invite` command updated to include bot invite link!
- Discord.js updated to v12.4.1
- Discord.js Opus updated to v0.3.3
- `ytdl-core` package updated to v4.0.2
- `ytsr` package removed and replaced with `yt-search` package due to former package breaking music query search functionality
### Bug-fixes
- Fixed the `play` command so it properly plays audio
  - Query search works as expected
  - Providing song and playlist links no longer cause the player to throw errors
- Enabled Privileged Gateway Intents to fix DoorMat-related functions and the `userinfo` command (due to Discord's new opt-in user privacy standards)

## v0.9.1
### Minor Updates
- `ytpl` package updated to v1.0.1
- `play` command updated:
  - Shows text channel's name instead of mention when joining a voice channel before playing a song
  - ytpl.validateURL() function changed to ytpl.validateID() per `ytpl` package update
  - Fixed "<>" slice from query so links now work properly if used with the <> characters
### Bug-fixes
- Fixed startup message not showing in log channel
- Fixed prefix not showing upon pinging the bot user

## v0.9
### Major Updates
- Discord.js upgraded to v12.3.1
- `trivia` command fully works! Play a game with up to 10 total players with 15 questions a game!
- New command category: **music**
  - 12 new commands: `clear`, `disconnect`, `join`, `nowplaying`, `pause`, `play`, `queue`, `remove`, `repeat`, `resume`, `shuffle`, and `skip`
  - New options to set now-playing messages, send embeds or plain text messages, or change channel topic now available in `music` command
- New `changelog` command to show the latest updates with Mr. Marshmallow
- Many helper functions moved to unified 'util.js' file under *config/bot* directory
  - 'categories.js' removed, merged with this new file
  - Some commands tweaked to adjust to this change
- Repository README has an updated format
### Minor Updates
- `quote` command now exports to a JSON file, import is still in the works
- Slight update in `quote list` embed footer
- Owner property in *config/bot/settings.json* is now an array, renamed to owners
  - Owner command updated to reflect change
- Bot shutdown message slightly changed and now shows in console too
- Console message in 'server.js' file removed

## v0.8.2
### Major Updates
- Mr. Marshmallow now requires **Ban Members** permission for sending ban messages
  - Checks leaving member against ban logs and sends the appropriate message
  - *guildBanAdd* event removed and code moved to *guildMemberRemove*
### Minor Updates
- Default leave and ban messages changed
- `userinfo` command shows how long a user has boosted a server, if applicable
- `invite` command link text slightly changed
- `dab` command slightly changed
- Slight code tweaks
### Bug-fixes
- Fixed an issue with the DoorMat where both the ban and leave messages appeared when a user was banned
- Fixed an issue with the `quote` command where default quotes couldn't be restored

## v0.8.1
### Major Updates
- Word filter now allows warning messages to be sent to user DMs instead of channels
  - Warning messages send to channel by default
### Minor Updates
- CorkBoard now allows posts without images or text (such as videos or documents)
### Bug-fixes
- Fixed an issue in CorkBoard's democratic mode where posts with multiple pins had issues showing in the server's pin channel
- Fixed an issue with the word filter where resetting to the defaults wipes out the server's config file

## v0.8
### Major Updates
- General software updates and removals
  - Discord.js upgraded to v12.2
  - Main 'index.js' file renamed to 'server.js'
  - Unnecessary packages (enmap, erlpack, better-sqlite-pool, bufferutil) removed
- Bot's configuration file ('settings.json') format updated
  - Logging and ticket channel IDs now collected under 'channels' entry
  - Server default values now collected under 'defaults' entry
  - Bot token no longer stored in */config/bot/settings.json*, uses dotenv
- Per-server configuration file ('config.json') format updated
  - DoorMat- and CorkBoard-related settings under "doormat" and "corkboard" entries, respectively
  - "gameInProgress" element moved to new 'games' entry and has one for each game mode (trivia and riddle)
  - "status" and "channel" elements for DoorMat/CorkBoard changed to "enabled" and "channelID" (respectively) for clarity
- All commands and events updated to reflect new bot/server config changes
- New user-defined word deny-list filter
  - Automatically detects messages with user-defined restricted words and deletes them if it can (requires **Manage Messages** permission)
  - Default deny-list found in new *config/bot/defaults* directory
  - New command `wordfilter` in "settings" category to set the server's options
  - *message* event updated to check for restricted words if word filter option is on
  - *message* event now allows the bot to return the server's prefix regardless if the user adds something after the mention or not
  - server prefix will not be returned if user has a restricted word with bot mention
- CorkBoard feature now has channel blacklisting and NSFW channel toggling
  - Deny certain channels the ability to pin posts to the CorkBoard
  - Posts from NSFW channels don't get pinned by default, can toggle to allow NSFW pins
  - `corkboard` command updated to allow deny-list settings and NSFW toggle configuration
- New server event: *guildBanAdd*, fires whenever a server member has been banned
  - New ban message added to bot's configuration file
  - `doormat` updated to allow ban message configuration
  - *guildCreate* event updated to add ban message to server configuration file
- `test` command removed
### Minor Updates
- Change log now organized by major updates, minor updates, and bug-fixes (if applicable)
- `quote` command improvements:
  - `quote list` now allows viewing up to 10 quotes per page, shows 6 by default
  - Can now export all server quotes to a simple text file; import still in the works
  - Default quote file slightly tweaked and moved to *config/bot/defaults* directory
  - Default quote file now has 2 new quotes for a total of 10
  - *guildCreate* event updated for default quote file location move
- *ready* event now shows the version of Mr. Marshmallow in the startup message
- *channelPinsUpdate* event can now only work in guilds; will not work in direct messages
- `botinfo` updated to display bot version; code slightly tweaked
- `joke` command now waits 2 seconds to tell the punchline
- `8ball` waits a about a second before replying
  - '8ballresponse.json' filename renamed to '8ball.json'
  - 8-ball responses mostly changed, now has 20 unique answers
- `say` and `reverse` incorporate wordfilter functionality
- 'require' statements for config data have been changed to read from file every time, removes cached config data
- 'console' event listener removed
- Slight code tweaks
- Updated the README.md file

## v0.7.2
### Major Updates
- New commands in the "fun" category:
  - `joke`: tells a random pun!
  - `reverse`: reverses whatever you say!
### Minor Updates
- `flip` command renamed to `coinflip` for clarity; original name is now an alias
- `serverinfo` updated to include server boost counts and levels!
- `botinfo` command updated to show bot latency and uptime in days
- `roll` command updated to allow rolling 100-sided die; code slightly tweaked
- `userinfo` command code cleaned up
- `evaluate` command code slightly tweaked; evaluation time now shows when result is longer than Discord message limit

## v0.7.1
### Bug-fixes
- *channelPinsUpdate* event fixed to prevent execution when unpinning a message from a channel

## v0.7
### Major Updates
- `quote` command fully functional
  - Add, delete, get, and list quotes stored for the server! Purge or reset them if you want, but there's no going back!
  - Import and export options currently in the works.
  - Now uses .json files to store quotes, no longer .txt files
  - Quote limit reduced from 500 to 300 per server to conserve storage/memory
  - Quote character limit of 500 imposed for storage conservation
  - *guildCreate* event updated to copy a base quotes.json file from the *config/bot* directory upon joining the server
- The CorkBoard has a new way to pin posts: **InstaPin Mode**! Pin a message through Discord's "Pin Message" option and the bot will pin it in the CorkBoard channel!
  - New event file: *channelPinsUpdate*. Will pin a post only if InstaPin Mode is set and there's at least one pinned message in a given channel.
  - Classic pin method (react with 📌) renamed to **Democratic Mode** to distinguish itself from the new mode.
  - `corkboard` command updated for pin mode toggle. By default, Democratic Mode is set when the bot joins a server.
  - *messageReactionAdd* and *messageReactionRemove* updated to check for non-embedded messages in the corkboard channel.
- New command in the **fun** category: `8ball`! Ask the 8-ball a question and you'll receive an answer!
### Minor Updates
- `userinfo` command updated to add roles, role count, and server owner distinction (if applicable) to embedded message
- `evaluate` command updated to write evaluated code longer than Discord's message limit to a .txt file in the *config/bot* directory
- `corkboard` and `doormat` commands updated to allow case-insensitivity when setting options

## v0.6
### Major Updates
- The DoorMat and CorkBoard features fully work!
  - *guildMemberAdd*, *guildMemberRemove*, *messageReactionAdd*, and *messageReactionRemove* events all work properly.
- New file in *config/bot*: 'categories.js'; one place to list all categories in the *commands* folder
  - 'command' handler file adjusted to accommodate moving category list to new file
- `load` and `unload` commands added (no longer necessary to restart the bot to add/remove commands)
### Minor Updates
- *message* event updated to return the bot's server prefix when bot is mentioned
- `invite` command now shows a link to the support server and to the GitHub repository (that's right here!)
- *guildCreate*, *guildDelete*, and *guildUnavailable* events updated to send embedded messages about server information

## v0.5.1
### Bug-fixes
- Updated the `prefix` command to adjust the new prefix to lowercase automatically (prevents accidental prefix "lock-out")
  - Allowed for setting capital letter prefixes, which couldn't be called as the bot automatically changes messages to lowercase for prefix checks.

## v0.5
### Major Updates
- New category: **settings**
  - `settings` command removed in favor of separate `prefix`, `doormat`, and `corkboard` commands
- Both DoorMat welcome and leave messages can be set.
- Channels can be set for DoorMat and CorkBoard, but the events for pinning messages to the entered CorkBoard channel are not implemented.
- All events in */events* adjusted for Discord.js v12
- `reload` command fully functional (no longer necessary to restart the bot after every change in existing commands)
### Minor Updates
- Fixed `userinfo` command (getting user mention didn't work, now it does)
- "Owner" category hidden from `help` command
- All commands have an information blurb at the top of their respective source code files

## v0.4 (in "experimental" branch)
### Major Updates
- Mr. Marshmallow updated to Discord.js v12.0 (now requires Node.js v12 or higher)
- All necessary configuration files for the bot to work properly have been moved to the *config/bot* directory.
- Custom data for each joined server is now stored in its own folder (listed by its ID) in the *config/server* directory.
- 8 new commands: `quote`, `flip`, `roll`, `riddle`, `trivia`, `botinfo`, `settings`, and `ticket`
- Removed 14 commands:
  - `steam` and `urban` from "fun" category
  - all commands from "moderation" category
  - `ping`, `uptime`, and `report` from "miscellaneous" category (first two commands merged into `botinfo`)
  - `test` moved to "owner" category
- Renamed `parrot` command to `say`
- Added a new category: **games**
- Per-server settings partially work. Custom prefixes can be set through the `settings` command, but planned features CorkBoard and DoorMat don't work just yet.
- More functionality added with new events (creates configuration data when it joins a server).

## v0.2 and v0.3
These versions have been rolled into v0.4 as one huge update.

## v0.1
### Major Updates
- First version of Mr. Marshmallow!
- Using Discord.js v11.5.1
- Most commands inherited from MenuDoc's Discord.JS-Tutorial repo
