const Spectator = require("../Spectator.js");

class ThieverySpectator extends Spectator {
    constructor(...args) {
        super(...args);
        
        if(this.game.state == "game") {
            this.socket.emit("state", this.game.spectatorInfo);
        } else if(this.game.state == "end") {
            this.socket.emit("end-game", this.game.endGameInfo);
        }
    }
}

module.exports = ThieverySpectator;