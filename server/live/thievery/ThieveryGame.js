const Game = require("../Game.js");

class ThieveryGame extends Game {
    
    sendPenaltyMinimumStreak = 3;
    
    get rankedPlayers() {
        return Object.values(this.players).sort((playerA, playerB) => playerB.answeredQuestions - playerA.answeredQuestions);
    }
    
    get info() {
        return {
            endAt: this.gameArgs.endAt,
            playerCount: Object.keys(this.players).length,
            sendPenaltyMinimumStreak: this.sendPenaltyMinimumStreak
        };
    };
    get spectatorInfo() {
        return {
            game: this.info,
            players: this.rankedPlayers.map(player => player.info)
        };
    };
    
    get damageInfo() {
        return {
            players: Object.fromEntries(Object.entries(this.players).map(([id, player]) => [id, player.damageInfo]))
        };
    };
    
    get hasReachedClearCondition() {
        if(this.gameArgs.endAt.type == "questions") {
            if(this.answeredQuestions < this.game.gameArgs.endAt.value)
                return false;
            
            if(this.game.gameArgs.endAt.everyone)
                return false;
            
            return `Game should end soon`;
        } else {
            return "..."
        }
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