const GameClient = require("./GameClient.js");


class Spectator extends GameClient {
    isModerator = false
    
    static mapPlayerPregame(player) {
        return {
            username: player.username,
            id: player.id
        };
    }
    
    updatePlayersPregame() {
        this.socket.emit("players",
            Object.values(this.game.players).map(Spectator.mapPlayerPregame)
        );
    }

    constructor(...args) {
        super(...args);
        if(this.initialQuery.moderationKey == this.game.moderationKey) {
            this.isModerator = true;
            this.socket.on("startgame", () => {
                if(this.game.state == "pregame") {
                    this.game.countDownToStart();
                }
            });
            this.socket.on("kick-player", playerid => {
                if(this.game.state == "pregame") {
                    let player = this.game.players[playerid];
                    if(!player) return false;
                    
                    player.socket.emit("server-disconnect", "You have been kicked from the game.");
                    player.socket.disconnect();
                    delete this.game.players[playerid];
                    
                    this.updatePlayersPregame();
                }
            });
            this.socket.emit("moderator");
            this.socket.emit("joincode", this.game.joincode);
        }
        
        if(this.game.state == "pregame") {
            this.updatePlayersPregame();
        }
        
    }
}

module.exports = Spectator;