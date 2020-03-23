# Mr. Marshmallow Changelog
This document serves as the complete changelog for Mr. Marshmallow's development. All versions listed here will record the changes that occur between versions uploaded to this repository.

## Version 0.5
- Fixed `userinfo` command (getting user mention didn't work, now it does)
- `settings` command removed in favor of separate `prefix`, `doormat`, and `corkboard` commands
- Both DoorMat welcome and leave messages can be set.
- Channels can be set for DoorMat and CorkBoard, but the events for pinning messages to the entered CorkBoard channel are not implemented.
- All events in */events* adjusted for Discord.js v12
- New category: **settings**
- "Owner" category hidden from `help` command
- All commands have an information blurb at the top of their respective files
- `reload` command works! No need to restart the bot after every change

## Version 0.4 (in "experimental" branch)
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

## Version 0.3
Kinda got lost during development. Sorry!

## Version 0.2
Kinda got lost during development. Sorry!

## Version 0.1
- First version of Mr. Marshmallow!
- Using Discord.js v11.x
- Most commands inherited from MenuDoc's Discord.JS-Tutorial repo
