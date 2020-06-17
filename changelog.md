# Mr. Marshmallow Change Log
This document serves as the complete change log for Mr. Marshmallow's development. All versions listed here record the changes that have occurred between versions uploaded to this repository.

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
