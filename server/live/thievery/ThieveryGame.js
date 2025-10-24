const Game = require("../Game.js");

class ThieveryGame extends Game {
    
    get rankedPlayers() {
        return Object.values(this.players).sort((playerA, playerB) => playerB.answeredQuestions - playerA.answeredQuestions);
    }
    
    get info() {
        return {
            endAt: this.gameArgs.endAt,
            playerCount: Object.keys(this.players).length,
            sendPenaltyMinimumStreak: 3
        };
    }
    get spectatorInfo() {
        return {
            game: this.info,
            players: this.rankedPlayers.map(player => player.info)
        };
    }
    
    constructor(set, gameArgs) {
        super("/games/thievery");
        
        this.set = set;
        this.gameArgs = gameArgs;
        
        this.on("update", () => {
            if(this.state == "game") {
                this.toSpectators.emit("state", this.spectatorInfo);
            }
        });
        
        this.on("statechange", () => {
            if(this.state == "game") this.emit("update");
        })
    }
}

module.exports = ThieveryGame;