import "/static/js/common/keypress-click.js";

import { randInt } from "/static/js/common/random.js";
import Player from "../Player.js";
import setWallpaper from "../wallpaper.js";
import ThieveryPlayerViews from "./ThieveryPlayerViews.js";
import ordinalSuffix from "../../common/ordinalSuffix.js";

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
                        .attr("keypress-click", (Number(buttonid) + 1))
                        .attr("style", "opacity: 0;") // for animating
                        .on("click", () => {
                            if(!clickedButton) {
                                questionContainer.addc("waiting")
                                this.socket.emit("answer", buttonid);
                                clickedButton = button;
                                questionContainer.els(".answer-button").forEach(btn =>
                                    btn.removeAttribute("keypress-click")
                                );
                            }
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
            
            if(correct) {
                questionContainer.anim({
                    scale: [1, 0.8],
                    translateY: [0, 20],
                    brightness: [1, 0.8],
                    opacity: [1, 0],
                    easing: "ease-in",
                    duration: 200
                }).onfinish(() => questionContainer.remove());
            } else {
                questionContainer.anim({
                    translateY: [0, 80],
                    rotate:     [0, randInt(-30, 30)],
                    brightness: [1, 0.2],
                    opacity: [1, 0],
                    easing: "ease-out",
                    duration: 1000
                }).onfinish(() => questionContainer.remove());
            }
            
        });
    }
    
    addBars(type, count) {
        
        const addId = ("streakBarGroup"+Math.random()).replace(".", "");
        
        for(let i = 0; i < count; i++) {
            doc.el("#stats-bar .streak-bars")
                .crel("div").addc(type).addc(addId);
        }
        
        const addedBars = doc.els("."+addId);
        
        addedBars
            .anim({
                opacity: [0, 1],
                translateY: [100, 0],
                easing: "ease-out",
                duration: 250,
                delayBetween: 100
            });
        
    }
    
    removeBars(type, count) {
        
        const toRemove = [...doc.els("#stats-bar .streak-bars > ."+type)].slice(-count);
        
        for(let i in toRemove) {
            const element = toRemove[i];
            const clientRect = element.getBoundingClientRect();
            
            setTimeout(() => {
                element.anim({
                    opacity: [1, 0],
                    translateY: [0, 100],
                    width: (element.nextSibling ? [clientRect.width, 0] : [clientRect.width, clientRect.width]),
                    easing: "ease-in",
                    duration: 250,
                }).onfinish(() => element.remove())
            }, i*100);
        }
        
    }
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-player.glsl");
        
        this.socket.on("state", state => {
            this.prepareView("game");
            
            doc.el(".streak-info")
                .on("click", () => {
                    this.socket.emit("send-streak")
                });
            
            console.log(state)
            
            if(state.game.endAt.type == "questions") {
                const questionsLeft =
                    Number(state.game.endAt.value) - state.self.answeredQuestions + state.self.penaltyQuestions;
                
                doc.el("#stats-bar .right-info")
                    .html("")
                        .txt(state.self.goalCondition);
            }
            
            const rankTextContainer = doc.el("#stats-bar .stat-rank");
            
            if(this._previousRank !== state.self.rank) {
                const newText = `${ordinalSuffix(state.self.rank)} <small>of ${state.game.playerCount}</small>`;
                const moveByPx = 50;
                const outAnimation = {
                    opacity: [1, 0],
                    brightness: [1, 0.9],
                    blur: [0, 1],
                    duration: 100,
                    easing: "ease-in"
                };
                const inAnimation = {
                    opacity: [0, 1],
                    brightness: [0.9, 1],
                    blur: [1, 0],
                    duration: 100,
                    easing: "ease-out"
                };
                
                if(this._previousRank > state.self.rank) {
                    rankTextContainer.anim({
                        ...outAnimation,
                        translateX: [0, moveByPx]
                    }).onfinish(() => {
                        rankTextContainer.innerHTML = newText;
                        rankTextContainer.anim({
                            ...inAnimation,
                            translateX: [-moveByPx, 0]
                        })
                    });
                } else {
                    rankTextContainer.anim({
                        ...outAnimation,
                        translateX: [0, -moveByPx]
                    }).onfinish(() => {
                        rankTextContainer.innerHTML = newText;
                        rankTextContainer.anim({
                            ...inAnimation,
                            translateX: [moveByPx, 0]
                        })
                    });
                }
            }
            this._previousRank = state.self.rank;
            
            if(state.self.streak >= state.game.sendPenaltyMinimumStreak) {
                doc.el(".streak-details").addc("can-send-damage");
                doc.el(".streak-info")
                    .attr("keypress-click", "space")
            } else {
                doc.el(".streak-details").remc("can-send-damage")
            }
            
            const changeStreakBarsBy = state.self.streak - doc.els(".streak-bar").length;
            if(changeStreakBarsBy > 0) {
                this.addBars("streak-bar", changeStreakBarsBy);
            } else if(changeStreakBarsBy < 0) {
                this.removeBars("streak-bar", -changeStreakBarsBy);
            }
            
            const changePenaltyBarsBy = state.self.penaltyQuestions - doc.els(".penalty-bar").length;
            if(changePenaltyBarsBy > 0) {
                this.addBars("penalty-bar", changePenaltyBarsBy);
            } else if(changePenaltyBarsBy < 0) {
                this.removeBars("penalty-bar", -changePenaltyBarsBy);
            }
            
        });
        this.socket.on("question", question => this.askQuestion(question));
    }
}

export default ThieveryPlayer;