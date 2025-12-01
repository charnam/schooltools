import GameClient from "./GameClient.js";
import Playlist from "./Playlist.js";
import { randArr } from "/static/js/common/random.js";

class Spectator extends GameClient {
    
    playlist = Playlist;
    lastPlayedSong = null;
    
    async playMusic(filename, title, creator) {
        
        const nowPlaying =
            doc.el("body")
                .crel("div").addc("now-playing").attr("style", "opacity: 0;")
                    .crel("img").addc("notes").attr("src", "/static/imports/bootstrap-icons/music-note-beamed.svg").prnt()
                    .crel("span")
                        .txt("Now Playing: ")
                        .crel("b")
                            .txt(title)
                        .prnt()
                        .txt(creator ? " by " : "")
                        .crel("b")
                            .txt(creator ?? "")
                        .prnt()
                    .prnt();
        
        (async () => {
            
            while(this.view == "counting_down") {
                await new Promise(res => 
                    setTimeout(res, 300)
                );
            }
            
            await nowPlaying.animAsync({
                opacity: [0, 1],
                translateY: [-50, 0],
                duration: 800,
                easing: "ease-out"
            });
            
            await new Promise(res => setTimeout(res, 3000))
            
            
            await nowPlaying.animAsync({
                opacity: [1, 0],
                translateY: [0, -50],
                duration: 800,
                easing: "ease-in"
            });
            
            nowPlaying.remove();
            
        })();
        
        
        await this.playSound(filename, "music");
        
    }
    
    async playRandomMusic(options = {}) {
        
        let availableMusic = this.playlist;
        
        availableMusic = availableMusic.filter((song) => !song.playsFirst == !options.first && song !== this.lastPlayedSong);
        
        const song = this.lastPlayedSong = randArr(availableMusic);
        
        await this.playMusic(song.filename, song.title, song.creator);
        
    }
    
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
            
            this.prepareView("pregame");
            doc.el("#startgame").on("click", () => this.socket.emit("startgame"));
        });
        
        this.socket.on("joincode", async code => {
            this.prepareView("pregame");
            
            doc.el("#joincode").html("").txt(code);
            
            const shortenedURL =
                await fetch("https://is.gd/create.php?format=json&url=" + window.location.protocol + "//" + window.location.host + "/live/thievery/play/?joincode="+code).then(evt => evt.json());
            if(shortenedURL.errorcode) {
                doc.el("#game-url").txt(window.location.host + "/live/thievery/play")
            } else {
                doc.el("#game-url")
                    .txt("Visit ")
                    .crel("span").txt(shortenedURL.shorturl.replace("https://", "")).prnt()
                    .txt(" to join");
                doc.el("body").addc("shortened-url");
            }
        });
        
        this.socket.on("players", players => {
            this.prepareView("pregame");
            
            doc.el("#pregame-header-players").html("")
                .txt(players.length + " player"+(players.length == 1 ? "" : "s"));
            
            const playersList =
                doc.el("#pregame-players-list")
            
            players.forEach(player => {
                if(
                    !this.currentState.current_pregame_players ||
                    !this.currentState.current_pregame_players.some(oldplayer => oldplayer.id == player.id)
                ) {
                    this.playSound("spectator/joingame.mp3");
                    let playerEl = playersList
                        .crel("div").addc("player").attr("playerid", player.id)
                            .txt(player.username)
                            .on("click", () => this.socket.emit("kick-player", player.id))
                    playerEl.anim({
                        scale: [0.8, 1],
                        opacity: [0, 1],
                        easing: "ease-out",
                        duration: 100
                    });
                }
            });
            
            for(let oldPlayer of doc.els("#pregame-players-list .player")) {
                if(
                    this.currentState.current_pregame_players &&
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
        });
        
        (async () => {
            while(true) {
                while(this.view == "game" || this.view == "counting_down") {
                    
                    await this.playRandomMusic({
                        first: this.view == "counting_down"
                    });
                    
                }
                
                await new Promise(res => {
                    setTimeout(res, 100);
                })
            }
        })();
    }
}

export default Spectator;