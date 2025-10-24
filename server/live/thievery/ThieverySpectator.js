const Spectator = require("../Spectator.js");

class ThieverySpectator extends Spectator {
    constructor(...args) {
        super(...args);
        
        if(this.state == "game") {
            this.socket.emit("state", this.spectatorInfo);
        }
    }
}

module.exports = ThieverySpectator;