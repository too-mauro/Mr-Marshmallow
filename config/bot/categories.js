/*
This file returns the categories of every command in the /commands directory and
is necessary for the command handler and the "load" command.
*/

exports.getCategories = () => {
    return ["fun", "games", "miscellaneous", "owner", "settings"];
}
