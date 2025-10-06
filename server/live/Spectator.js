const Player = require("./Player.js");

class Spectator extends Player {
    isModerator = false
    
    constructor(...args) {
        super(...args);
        if(this.initialQuery.moderationKey == this.game.moderationKey) {
            this.isModerator = true;
            this.socket.on("startgame", () => {
                this.game.countDownToStart();
            });
            this.socket.emit("moderator")
            this.socket.emit("joincode", this.game.joincode);
        }
        
        
    }
}

module.exports = Spectator;