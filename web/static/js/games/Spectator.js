import GameClient from "./GameClient.js";

class Spectator extends GameClient {
    constructor(namespace, args) {
        const params = new URLSearchParams(window.location.search);

        super(namespace, {
            type: "spectate",
            gameid: params.get("id"),
            ...args
        });
        
        this.socket.on("moderator", () => {
            this.isModerator = true;
            doc.el("body").addc("moderator");
            doc.el("#startgame").on("click", () => this.socket.emit("startgame"));
        });
        
        this.socket.on("joincode", code => {
            doc.el("#joincode").html("").txt(code);
        });
        
        this.socket.on("players", players => {
            doc.el("#pregame-header-players").html("")
                .txt(players.length + " player"+(players.length == 1 ? "" : "s"));
            
            const playersList =
                doc.el("#pregame-players-list")
            
            players.forEach(player => {
                if(
                    !this.currentState.current_pregame_players ||
                    !this.currentState.current_pregame_players.some(oldplayer => oldplayer.id == player.id)
                ) {
                    let playerEl = playersList
                        .crel("div").addc("player").attr("playerid", player.id)
                            .txt(player.username)
                            .on("click", () => this.socket.emit("kick-player", player.id))
                    playerEl.anim({
                        scaleX: [1.2, 0.7],
                        scaleY: [0.8, 1.1],
                        opacity: [0, 1],
                        translateX: [-200, 100],
                        easing: "ease-out",
                        duration: 100
                    }).onfinish(() =>
                        playerEl.anim({
                            scaleX: [0.7, 1],
                            scaleY: [1.1, 1],
                            translateX: [100, 0],
                            easing: "ease-in-out",
                            duration: 300
                        })
                    );
                }
            });
            
            for(let oldPlayer of doc.els("#pregame-players-list .player")) {
                if(
                    this.currentState.current_pregame_players.some(player => player.id == oldPlayer.attr("playerid")) &&
                    !players.some(player => player.id == oldPlayer.attr("playerid"))
                )
                    oldPlayer.anim({
                        opacity: [1, 0],
                        easing: "ease-out",
                        duration: 500,
                    }).onfinish(() => oldPlayer.remove());
            }
            
            this.currentState.current_pregame_players = players;
        })
    }
}

export default Spectator;