const Game = require("../Game.js");

class ThieveryGame extends Game {
    
    get info() {
        return {
            endAt: this.gameArgs.endAt
        };
    }
    
    constructor(set, gameArgs) {
        super("/games/thievery");
        
        this.set = set;
        this.gameArgs = gameArgs;
        
        this.on("update", () => {
            if(this.state == "game") {
                this.toSpectators.emit("state", 
                    {
                        game: this.info,
                        players: Object.values(this.players).map(player => player.info)
                    }
                );
            }
        });
        
        this.on("statechange", () => {
            if(this.state == "game") this.emit("update");
        })
    }
}

module.exports = ThieveryGame;