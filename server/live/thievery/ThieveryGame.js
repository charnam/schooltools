const Game = require("../Game.js");

class ThieveryGame extends Game {
    
    get info() {
        return {
            endtype: this.endtype
        };
    }
    
    constructor(set, gameArgs) {
        super("/games/thievery");
        
        this.set = set;
        this.gameArgs = gameArgs;
        
        this.on("update", () => {
            if(this.state == "game") {
                this.toSpectators.emit("game-state", 
                    {
                        game: this.info,
                        players: Object.values(this.players).map(player => player.info)
                    }
                );
            }
        })
    }
}

module.exports = ThieveryGame;