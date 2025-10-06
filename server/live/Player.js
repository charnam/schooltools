
class Player { // Spectator inherits this, keep things bare
    constructor(socket, game, query, session) {
        this.socket = socket;
        if(session && session.user)
            this.userid = session.user.id;
        this.game = game;
        this.initialQuery = query;
        
        this.socket.emit("gamestate", game.state);
    }
}

module.exports = Player;