import Spectator from "../Spectator.js";
import setWallpaper from "../wallpaper.js";
import ThieverySpectatorViews from "./ThieverySpectatorViews.js";

class ThieverySpectator extends Spectator {
    Views = ThieverySpectatorViews;
    
    updateBar(name, value, penalties) {
        const chart = doc.el("#game .bar-chart");
        let bar = document.getElementsByName(name)[0];
        
        if(!bar) {
            bar = chart.el(".bars").crel("div").addc("bar").attr("name", name)
        }
        
        if(!bar.classList.contains("bar")) {
            throw new Error("Bar / player name conflicts with another named element on the page.");
        }
        
        bar.attr("style", "--value: "+value+"; --penaltyQuestions: ");
    }
    
    updateBarChart() {
        
    }
    
    renderBarChart() {
        const targetValue = 10;
        const participants = 20;
        
        const maxValue = Math.max(targetValue, participants)
        
        if(!doc.el("#game .bar-chart")) {
            doc.el("#game")
                .crel("div").addc("bar-chart")
                    .crel("div").addc("y-axis").prnt()
                    .crel("div").addc("x-axis").prnt()
                    
                    .crel("div").addc("bars")
                        .crel("div").addc("target-line")
                            .txt(targetValue)
                        .prnt()
                    .prnt();
        }
        
        doc.el("#game .bar-chart").attr("style", "--target-value: "+targetValue+"; --max-value: "+maxValue+"; --participants: "+participants+";");
        
        for(let i = 0; i < participants; i++) {
            this.updateBar(Math.random(), i);
        }
        
    }
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-leaderboard.glsl");
    }
}

export default ThieverySpectator;