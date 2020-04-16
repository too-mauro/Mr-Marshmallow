# Mr. Marshmallow Changelog
This document serves as the complete changelog for Mr. Marshmallow's development. All versions listed here will record the changes that occur between versions uploaded to this repository.

## v0.7.2
- `flip` command renamed to `coinflip` for clarity; original name is now an alias
- New commands in the "fun" category:
  - `joke`: tells a random pun!
  - `reverse`: reverses whatever you say!
- `serverinfo` updated to include server boost counts and levels!
- `botinfo` command updated to show bot latency and uptime in days
- `roll` command updated to allow rolling 100-sided die; code slightly tweaked
- `userinfo` command code cleaned up
- `evaluate` command code slightly tweaked; evaluation time now shows when result is longer than Discord message limit

## v0.7.1
- *channelPinsUpdate* event fixed to prevent the code from running when unpinning a message from a channel

## v0.7
- `quote` command works!
  - Add, delete, get, and list quotes stored for the server! Purge or reset them if you want, but there's no going back!
  - Import and export options currently in the works.
  - Now uses .json files to store quotes, no longer .txt files
  - Quote limit reduced from 500 to 300 per server to conserve storage/memory
  - Quote character limit of 500 imposed for storage conservation
  - *guildCreate* event updated to copy a base quotes.json file from the *config/bot* directory upon joining the server
- `corkboard` has a new way to pin posts: **InstaPin Mode**! Pin a message through Discord's "Pin Message" option and the bot will pin it in the CorkBoard channel!
  - New event file: *channelPinsUpdate*. Will pin a post only if InstaPin Mode is set and there's at least one pinned message in a given channel.
  - Classic pin method (react with 📌) renamed to **Democratic Mode** to distinguish itself from the new mode.
  - `corkboard` command updated for pin mode toggle. By default, Democratic Mode is set when the bot joins a server.
  - *messageReactionAdd* and *messageReactionRemove* updated to check for non-embedded messages in the corkboard channel.
- `userinfo` command updated to add roles, role count, and server owner distinction (if applicable) to embedded message
- `evaluate` command updated to write evaluated code longer than Discord's message limit to a .txt file in the *config/bot* directory
- New command in the **fun** category: `8ball`! Ask the 8-ball a question and you'll receive an answer!
- `corkboard` and `doormat` commands updated to allow case-insensitivity when setting options

## v0.6
- The DoorMat and CorkBoard features fully work!
  - *guildMemberAdd*, *guildMemberRemove*, *messageReactionAdd*, and *messageReactionRemove* events all work properly.
- Forgot your server's prefix? Don't worry, ping the bot and it will tell you!
- More `owner` commands: `load` and `unload`! No need to turn off the bot to add or remove commands!
- New file in *config/bot*: 'categories.js'; one place to list all categories in the *commands* folder
- 'command' handler file adjusted to accommodate moving category list to new file
- `invite` command now shows a link to the support server and to the GitHub repository (that's right here!)
- *guildCreate*, *guildDelete*, and *guildUnavailable* events updated to send embedded messages about server information

## v0.5.1
- Updated the `prefix` command to adjust the new prefix to lowercase automatically (prevents accidental prefix "lock-out")
  - Allowed for setting capital letter prefixes, which couldn't be called as the bot automatically put bot command messages as lowercase.

## v0.5
- Fixed `userinfo` command (getting user mention didn't work, now it does)
- `settings` command removed in favor of separate `prefix`, `doormat`, and `corkboard` commands
- Both DoorMat welcome and leave messages can be set.
- Channels can be set for DoorMat and CorkBoard, but the events for pinning messages to the entered CorkBoard channel are not implemented.
- All events in */events* adjusted for Discord.js v12
- New category: **settings**
- "Owner" category hidden from `help` command
- All commands have an information blurb at the top of their respective files
- `reload` command works! No need to restart the bot after every change

## v0.4 (in "experimental" branch)
- Uses v12.x of Discord.js (upgraded from v11.x) and now requires Node.js v12 or higher
- All necessary configuration files for the bot to work properly have been moved to the *config/bot* directory.
- Custom data for each joined server is now stored in its own folder (listed by its ID) in the *config/server* directory.
- 8 new commands: `quote`, `flip`, `roll`, `riddle`, `trivia`, `botinfo`, `settings`, and `ticket`
- Renamed `parrot` command to `say`
- Removed 14 commands:
  - `steam` and `urban` from "fun" category
  - all commands from "moderation" category
  - `ping`, `uptime`, and `report` from "miscellaneous" category (first two commands merged into `botinfo`)
  - `test` moved to "owner" category
- Added a new category: **games**
- Per-server settings partially work. Custom prefixes can be set through the `settings` command, but planned features CorkBoard and DoorMat don't work just yet.
- More functionality added with new events (creates configuration data when it joins a server).

## v0.2 and v0.3
These versions have been rolled into v0.4 as one huge update.

## v0.1
- First version of Mr. Marshmallow!
- Using Discord.js v11.x
- Most commands inherited from MenuDoc's Discord.JS-Tutorial repo
