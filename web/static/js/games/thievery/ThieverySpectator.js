import Spectator from "../Spectator.js";
import setWallpaper from "../wallpaper.js";
import ThieverySpectatorViews from "./ThieverySpectatorViews.js";
import ordinalSuffix from "../../common/ordinalSuffix.js";

class ThieverySpectator extends Spectator {
    Views = ThieverySpectatorViews;
    
    updateBar(name, title, value, penalties, rank) {
        const chart = doc.el("#game .bar-chart");
        let bar = document.getElementsByName(name)[0];
        
        if(!bar) {
            bar = chart.el(".bars")
                .crel("div").addc("bar").attr("name", name).attr("username", title)
                    .crel("div").addc("penalty-questions").prnt();
        }
        
        if(!bar.classList.contains("bar")) {
            throw new Error("Bar / player name conflicts with another named element on the page.");
        }
        
        if(bar.el(".penalty-questions").attr("penaltyQuestions") < penalties) {
            bar.anim({
                translateX: [-10, 10, -8, 8, -5, 5, 0],
                easing: "ease-out",
                duration: 500
            });
        }
        if(bar.attr("value") < value) {
            bar.anim({
                brightness: [1.2, 1],
                easing: "ease-out",
                duration: 300
            });
        }
        
        bar
            .attr("value", value)
            .attr("style", `
                --rank: ${rank};
                --value: ${value};
                --penaltyQuestions: ${penalties};
            `)
            .el(".penalty-questions")
                .attr("penaltyQuestions", penalties);
            
    }
    
    updateBarChart(state) {
        
        this.prepareView("game");
        
        if(!doc.el("#game .bar-chart")) {
            doc.el("#game")
                .crel("div").addc("bar-chart")
                    .crel("div").addc("y-axis").prnt()
                    .crel("div").addc("x-axis").prnt()
                    
                    .crel("div").addc("bars")
                        .crel("div").addc("target-line").prnt()
                    .prnt();
        }
        
        const targetValue = state.game.endAt.value;
        const participants = state.players.length;
        
        const highScore = Math.max(...state.players.map(player => player.answeredQuestions));
        
        const maxValue = Math.max(targetValue, highScore);
        
        doc.el("#game .bar-chart").attr("style", `
                --target-value: ${targetValue};
                --max-value: ${maxValue};
                --participants: ${participants};
            `)
            .el(".target-line")
                .html("").txt(targetValue)
            .prnt();
        
        for(let rank in state.players) {
            const player = state.players[rank];
            this.updateBar(player.id, player.username, player.answeredQuestions, player.penaltyQuestions, rank);
        }
        
    }
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-leaderboard.glsl");
        
        this.socket.on("state", (state) => {
            
            this.updateBarChart(state);
            
        });
        
        this.socket.on("gamestate", state => {
            if(state == "pre-end") {
                if(this.playingSounds.music) {
                    (async () => {
                        for(let i = 0; i < 10; i++) {
                            this.playingSounds.music.volume-=0.1;
                            await new Promise(res => setTimeout(res, 80));
                        }
                        
                        this.playingSounds.music.pause();
                    })();
                }
                
                this.playSound("spectator/scores.mp3", "scoresJingle");
            }
            
        });
        
        this.socket.on("end-game", info => {
            this.prepareView("end");
            const endContainer = doc.el("#end");
            
            endContainer.html("");
            
            const addPlayerColumn = (title, players) => {
                const col = endContainer.crel("div").addc("end-col")
                
                col.crel("div").addc("end-col-title")
                    .txt(title);
                
                for(let player of players) {
                    const playerEl = col.crel("div").addc("end-player")
                    
                    playerEl.crel("div").addc("end-player-name").txt(player[0]);
                    playerEl.crel("div").addc("end-player-info").txt(player[1])
                }
            }
            
            addPlayerColumn("Rank", info.finalRanks.map(player => [
                player.username,
                ordinalSuffix(player.rank)
            ]));
            addPlayerColumn("Accuracy", info.accuratePlayers.map(player => [
                player.username,
                isNaN(player.accuracy) ? "N/A" : Math.round(player.accuracy * 1000) / 10 + "%"
            ]));
            
            endContainer
                .crel("div").addc("end-col")
                    .crel("div").addc("end-col-title")
                        .txt("(beta)")
                    .prnt()
                    .crel("div").addc("end-player")
                        .txt("More information will be here in a later version.")
            
            endContainer.els(".end-col").anim({translateY: [-10, 0], opacity: [0, 1], duration: 500, delayBetween: 1000, easing: "ease-out"})
        })
        
        this.socket.on("player-attacks-player", info => {
            const fromBar = document.getElementsByName(info.from)[0];
            const toBar = document.getElementsByName(info.to)[0];
            
            if(!fromBar || !toBar) return;
            
            const penaltyShot = doc.crel("div").addc("penalty-shot");
            const jumpHeightMin = Math.min(window.innerWidth, window.innerHeight) * 0.1;
            const fadeTime = 20;
            const duration = 500;
            
            const fromRect = fromBar.getBoundingClientRect();
            const toRect = toBar.getBoundingClientRect();
            
            const jumpTo = Math.min(fromRect.y, toRect.y) - jumpHeightMin;
            
            penaltyShot.anim({
                opacity: [0, 1],
                duration: fadeTime,
                easing: "linear"
            });
            setTimeout(() => {
                penaltyShot.anim({
                    opacity: [1, 0],
                    duration: fadeTime,
                    easing: "linear"
                });
            }, duration - fadeTime)
            
            penaltyShot.anim({
                left: [
                    fromRect.x + fromRect.width / 2,
                    toRect.x + toRect.width / 2
                ],
                easing: "linear",
                duration
            });
            
            // TODO: fix the ball time ratio code issues
            const timeRatio = (fromRect.y - jumpTo) / (toRect.y - jumpTo);
            
            penaltyShot.anim({
                top: [fromRect.y, jumpTo],
                brightness: [0.5, 1],
                easing: "ease-out",
                duration: duration * timeRatio
            }).onfinish(() => {
                
                penaltyShot.anim({
                    top: [jumpTo, toRect.y],
                    easing: "ease-in",
                    duration: duration - duration * timeRatio
                }).onfinish(() => {
                    penaltyShot.remove();
                });
                
            });
            
        })
    }
}

export default ThieverySpectator;