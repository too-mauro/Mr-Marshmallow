## Changelog
This document serves as the complete changelog for Mr. Marshmallow's development. All versions listed here will record the changes that occur between versions uploaded to this repository.

### Version 0.4
- Upgraded Discord.js from v11.x to v12.x
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

### Version 0.1
- First version of Mr. Marshmallow!
- Using Discord.js v11.x
- Most commands inherited from MenuDoc's Discord.JS-Tutorial repo
