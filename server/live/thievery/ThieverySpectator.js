const Spectator = require("../Spectator.js");

function mapPlayer(player) {
    return {
        username: player.username
    };
}

class ThieverySpectator extends Spectator {
    updatePlayersPregame() {
        this.socket.emit("players",
            this.game.players.map(mapPlayer)
        );
    }
    constructor(...args) {
        super(...args);
        
        if(this.game.state == "pregame") {
            this.updatePlayersPregame();
        }
    }
}

module.exports = ThieverySpectator;