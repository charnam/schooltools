const Game = require("../Game.js");

class ThieveryGame extends Game {
    
    handleNewPlayer(player) {
        if(this.state == "pregame")
            this.spectators.forEach(spectator => spectator.updatePlayersPregame());
        
        
    }
    
    constructor(set, gameArgs) {
        super();
        
        this.set = set;
        this.gameArgs = gameArgs;
    }
}

module.exports = ThieveryGame;