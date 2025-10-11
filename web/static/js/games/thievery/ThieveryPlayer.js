
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
            scale: [0.9, 1],
            translateY: [200, 0],
            brightness: [0.8, 1],
            easing: "ease-out",
            duration: 180,
            delayBetween: 30
        })
        
        this.socket.once("answer-result", (correct) => {
            questionContainer.anim({
                scale: [1, 0.8],
                translateY: [0, 20],
                brightness: [1, 0.8],
                opacity: [1, 0],
                easing: "ease-in",
                duration: 200
            }).onfinish(() => questionContainer.remove());
            console.log(correct ? "correct" : "incorrect");
        });
    }
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-player.glsl");
        
        this.socket.on("question", question => this.askQuestion(question));
    }
}

export default ThieveryPlayer;