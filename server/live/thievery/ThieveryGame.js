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
    get endGameInfo() {
        const players = this.rankedPlayers.map(player => player.info);
        return {
            finalRanks: players
        };
    }
    
    get damageInfo() {
        return {
            players: Object.fromEntries(Object.entries(this.players).map(([id, player]) => [id, player.damageInfo]))
        };
    };
    
    get hasReachedClearCondition() {
        if(this.gameArgs.endAt.type == "questions") {
            const questionsToGoal = Math[this.gameArgs.endAt.everyone ? "min" : "max"](
                ...Object.values(this.players).map(player => player.answeredQuestions)
            );
            if(questionsToGoal < this.gameArgs.endAt.value)
                return false;
            
            return true;
        } else {
            return true;
        }
    }
    
    end() {
        this.state = "pre-end";
        setTimeout(() => {
            this.state = "end";
            this.toSpectators.emit("end-game", this.endGameInfo);
        }, 500)
    }
    
    constructor(set, gameArgs) {
        super("/games/thievery");
        
        this.set = set;
        this.gameArgs = gameArgs;
        
        this.on("update", () => {
            if(this.state == "game") {
                if(this.hasReachedClearCondition) {
                    this.end();
                } else {
                    this.toSpectators.emit("state", this.spectatorInfo);
                }
            }
        });
        
        this.on("statechange", () => {
            if(this.state == "game") this.emit("update");
        })
    }
}

module.exports = ThieveryGame;