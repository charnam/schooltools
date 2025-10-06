import GameClient from "./GameClient.js";

class Spectator extends GameClient {
    constructor(namespace, args) {
        super(namespace, {
            type: "spectate",
            ...args
        });
        
        this.socket.on("moderator", () => {
            this.isModerator = true;
        });
        this.socket.on("joincode", code => {
            doc.el("#joincode").html("").txt(code);
        })
    }
}

export default Spectator;