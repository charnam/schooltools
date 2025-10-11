
const mkid = require("crypto").randomUUID;

class GameClient {
    constructor(socket, game, query, session) {
        this.socket = socket;
        if(session && session.user)
            this.userid = session.user.id;
        this.game = game;
        this.initialQuery = query;
        
        this.id = mkid();
        
        this.socket.emit("gamestate", game.state);
        this.game.on("statechange", () => this.socket.emit("gamestate", game.state));
    }
}

module.exports = GameClient;