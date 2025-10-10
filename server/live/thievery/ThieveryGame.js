const Game = require("../Game.js");

class ThieveryGame extends Game {
    constructor(set, gameArgs) {
        super();
        
        this.set = set;
        this.gameArgs = gameArgs;
    }
}

module.exports = ThieveryGame;