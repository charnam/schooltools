const GameClient = require("./GameClient.js");

class Player extends GameClient {
    constructor(...args) {
        super(...args);
        
        this.username = this.initialQuery.username;
    }
}

module.exports = Player;