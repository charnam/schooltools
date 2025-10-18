
import { randInt } from "/static/js/common/random.js";
import Player from "../Player.js";
import setWallpaper from "../wallpaper.js";
import ThieveryPlayerViews from "./ThieveryPlayerViews.js";

class ThieveryPlayer extends Player {
    Views = ThieveryPlayerViews;
    
    askQuestion(details) {
        const questionContainer =
            doc.el("#game")
                .crel("div").addc("question")
                    .crel("div").addc("question-text")
                        .txt(details.question)
                    .prnt()
                    .crel("div").addc("question-buttons")
                    .prnt()
        
        let clickedButton = null;
        
        for(let [buttonid, answer] of Object.entries(details.answers)) {
            
            let button =
                questionContainer.el(".question-buttons")
                    .crel("button")
                        .txt(answer.text)
                        .addc("answer-button")
                        .attr("style", "opacity: 0;") // for animating
                        .on("click", () => {
                            questionContainer.addc("waiting")
                            this.socket.emit("answer", buttonid);
                            clickedButton = button;
                        })
                    .prnt()
            
        }
        
        questionContainer.anim({
            opacity: [0, 1],
            translateY: [-100, 0],
            duration: 300,
            easing: "ease-out"
        })
        
        questionContainer.els(".answer-button").anim({
            opacity: [0, 1],
            scaleX: [0.9, 1],
            scaleY: [1.2, 1],
            translateY: [200, -10],
            brightness: [0.8, 1],
            rotate: [randInt(-10, 10), 0],
            easing: "ease-out",
            duration: 300,
            delayBetween: 30
        })
        
        this.socket.once("answer-result", (correct) => {
            
            let animEl = doc.el("#game")
                .crel("div").addc(correct ? "correct-animation" : "incorrect-animation");
            
            setTimeout(() => animEl.remove(), 1000);
            
            this.playSound(correct ? "player/correct.wav" : "player/incorrect.wav")
            
            if(!correct) {
                questionContainer.anim({
                    //translateX: [0, -10, 10, -8, 8, -5, 5, -2, 2, 0 ],
                    translateY: [0, 80],
                    rotate:     [0, randInt(-30, 30)],
                    brightness: [1, 0.2],
                    opacity: [1, 0],
                    easing: "ease-out",
                    duration: 1000
                }).onfinish(() => questionContainer.remove());
            } else {
                questionContainer.anim({
                    scale: [1, 0.8],
                    translateY: [0, 20],
                    brightness: [1, 0.8],
                    opacity: [1, 0],
                    easing: "ease-in",
                    duration: 200
                }).onfinish(() => questionContainer.remove());
            }
            
        });
    }
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-player.glsl");
        
        this.socket.on("state", state => {
            this.prepareView("game");
            
            if(state.game.endAt.type == "questions") {
                const questionsLeft = Number(state.game.endAt.value);
                
                if(questionsLeft > 0)
                    doc.el("#stats-bar .right-info")
                        .html("")
                            .txt(
                                `${questionsLeft} question${questionsLeft == 1 ? "" : "s"} to goal`
                            )
                else
                    doc.el("#stats-bar.right-info")
                        .html("")
                            .txt(
                                `Goal reached!`
                            )
            }
        });
        this.socket.on("question", question => this.askQuestion(question));
    }
}

export default ThieveryPlayer;