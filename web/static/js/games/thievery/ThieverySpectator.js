import Spectator from "../Spectator.js";
import setWallpaper from "../wallpaper.js";
import ThieverySpectatorViews from "./ThieverySpectatorViews.js";

class ThieverySpectator extends Spectator {
    Views = ThieverySpectatorViews;
    
    updateBar(name, value, penalties) {
        const chart = doc.el("#game .bar-chart");
        let bar = document.getElementsByName(name)[0];
        
        if(!bar) {
            bar = chart.el(".bars")
                .crel("div").addc("bar").attr("name", name)
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
        
        bar
            .attr("value", value)
            .attr("style", `
                --value: ${value};
                --penaltyQuestions: ${penalties};
            `)
            .el(".penalty-questions")
                .attr("penaltyQuestions", penalties);
            
    }
    
    updateBarChart(state) {
        
        console.log(state);
        
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
        
        for(let player of state.players) {
            this.updateBar(player.username, player.answeredQuestions, player.penaltyQuestions);
        }
        
    }
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-leaderboard.glsl");
        
        this.socket.on("state", (state) => {
            
            this.updateBarChart(state);
            
        })
    }
}

export default ThieverySpectator;