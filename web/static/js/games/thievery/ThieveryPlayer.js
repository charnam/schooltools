import "/static/js/common/keypress-click.js";

import { randInt, randArr } from "/static/js/common/random.js";
import Player from "../Player.js";
import setWallpaper from "../wallpaper.js";
import ThieveryPlayerViews from "./ThieveryPlayerViews.js";
import ordinalSuffix from "../../common/ordinalSuffix.js";

class ThieveryPlayer extends Player {
    Views = ThieveryPlayerViews;
    
    askQuestion(details) {
        const questionId = this._currentQuestionId = Date.now();
        
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
                        .attr("style", "opacity: 0;") // for fading in
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
            if(this._currentQuestionId !== questionId) return;
            
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
    
    cancelQuestion() {
        this._currentQuestionId = null;
        
        const questions = doc.els("#game .question");
        
        for(let question of questions) {
            question.addc("cancelled");
            question.style.pointerEvents = "none";
            
            for(let clickable of question.els("[keypress-click]"))
                clickable.removeAttribute("keypress-click");
        }
        
        questions
            .anim({
                scale: [1, 0.8],
                opacity: [1, 0],
                translateY: [0, 20],
                duration: 300,
                easing: "ease-in"
            })
        
        setTimeout(() => {
            for(let question of questions) {
                question.remove();
            }
        }, 300);
    }
    
    addBars(type, count) {
        
        const addId = ("streakBarGroup"+Math.random()).replace(".", "");
        
        for(let i = 0; i < count; i++) {
            const bar = document.createElement("div")
            
            if(type == "penalty-bar")
                doc.el("#stats-bar .streak-bars").prepend(bar);
            else
                doc.el("#stats-bar .streak-bars").appendChild(bar);
            
            bar
                .attr("style", "opacity: 0;")
                .addc(type)
                .addc(addId);
        }
        
        const addedBars = [...doc.els("."+addId)];
        if(type == "penalty-bar")
            addedBars.reverse();
        
        for(let i in addedBars) {
            const element = addedBars[i];
            const clientRect = element.getBoundingClientRect();
            
            element.style.width = "0";
            
            setTimeout(() => {
                element.anim({
                    opacity: [0, 1],
                    translateY: [100, 0],
                    width: (element.nextSibling ? [0, clientRect.width] : [clientRect.width, clientRect.width]),
                    startValues: false,
                    keepValues: false,
                    easing: "ease-out",
                    duration: 250
                });
                element.attr("style", "")
            }, i*100);
        }
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
    
    getDamageSelectWindow() {
        
        let damageSelectWindow = doc.el(".damage-select:not(.cancelled)");
        if(!damageSelectWindow) {
            this.cancelQuestion();
            damageSelectWindow = doc.el("#game")
                .crel("div").attr("class", "damage-select")
                
            damageSelectWindow
                .anim({
                    opacity: [0, 1],
                    scale: [1.2, 1],
                    easing: "ease-out",
                    duration: 300
                })
        }
        
        if(doc.el(".question:not(.cancelled)"))
            this.cancelQuestion();
        
        return damageSelectWindow;
        
    }
    
    updateDamageSelect(info) {
        this._damageSelectInfo = info;
        const damageSelectWindow = this.getDamageSelectWindow();
        
        for(let playerId in info.players) {
            let playerEl = damageSelectWindow.el(`.player[player-id="${playerId}"]`);
            if(!playerEl) {
                playerEl = damageSelectWindow
                    .crel("div").addc("player")
                        .attr("player-id", playerId)
                        .crel("div").addc("player-penalty-value").prnt()
                        .crel("div").addc("player-bar").prnt()
                        .crel("div").addc("player-answered-value").prnt()
                        .crel("div").addc("player-username").prnt()
                        .on("click", () => {
                            if(this.damageSelectSelectedPlayer == playerId) {
                                for(let playerEl of damageSelectWindow.els(`.player:not([player-id="${playerId}"])`)) {
                                    playerEl.anim({
                                        opacity: [1, 0],
                                        translateX: [0, -10],
                                        brightness: [1, 0.2],
                                        delayBetween: 20,
                                        duration: 200,
                                        easing: "ease-out"
                                    });
                                }
                                this.closeDamageSelect();
                                this.socket.emit("send-damage", playerId);
                            } else {
                                this.damageSelectSelectPlayer(playerId);
                            }
                        });
            }
            
            const player = info.players[playerId];
            
            playerEl.attr("style", `
                --rank: ${player.rank};
                --penaltyQuestions: ${player.penaltyQuestions};
                --answeredQuestions: ${player.answeredQuestions};
            `);
            
            playerEl.el(".player-username").html("").txt(player.username);
            
            playerEl.el(".player-penalty-value").html("")
            if(player.penaltyQuestions > 0)
                playerEl.el(".player-penalty-value").txt(player.penaltyQuestions);
            
            playerEl.el(".player-answered-value").html("").txt(player.answeredQuestions);
            
            this.damageSelectSelectPlayer();
        }
    }
    
    closeDamageSelect() {
        
        for(let damageSelectWindow of doc.els(".damage-select:not(.cancelled)")) {
            for(let clickable of damageSelectWindow.els("[keypress-click]")) {
                clickable.removeAttribute("keypress-click");
            }
            
            damageSelectWindow.addc("closing").addc("cancelled");
            damageSelectWindow.anim({
                scaleX: [1, 2],
                scaleY: [1, 1.5],
                opacity: [1, 0],
                duration: 300,
                easing: "ease-out"
            }).onfinish(() => {
                damageSelectWindow.remove();
            });
        }
        
    }
    
    damageSelectSelectPlayer(playerid) {
        const info = this._damageSelectInfo;
        
        if(!info || !info.players)
            return;
        
        const damageSelectWindow = this.getDamageSelectWindow();
        
        if(playerid)
            this.damageSelectSelectedPlayer = playerid;
        else if(!this.damageSelectSelectedPlayer)
            this.damageSelectSelectedPlayer = randArr(Object.keys(info.players))
        
        const selectedRank = info.players[this.damageSelectSelectedPlayer].rank
        damageSelectWindow.attr("style", `
            --maxQuestionsAnswered: ${Math.max(...Object.values(info.players).map(player => player.answeredQuestions))};
            --selected-player: ${selectedRank - 1};
        `);
        
        for(let player of damageSelectWindow.els(".player.selected, .player[keypress-click]")) {
            player.remc("selected");
            player.removeAttribute("keypress-click");
        }
        
        const selectedPlayer = damageSelectWindow.el(".player[player-id=\""+this.damageSelectSelectedPlayer+"\"]");
        if(selectedPlayer) {
            selectedPlayer.addc("selected");
            selectedPlayer.attr("keypress-click", "space");
        }
        
        const upPlayerEntry = Object.entries(info.players).find(entry => entry[1].rank == selectedRank - 1);
        const downPlayerEntry = Object.entries(info.players).find(entry => entry[1].rank == selectedRank + 1);
        
        if(upPlayerEntry) {
            const upPlayerEl = damageSelectWindow.el(`.player[player-id="${upPlayerEntry[0]}"`);
            if(upPlayerEl)
                upPlayerEl.attr("keypress-click", "ArrowUp");
        }
        if(downPlayerEntry) {
            const downPlayerEl = damageSelectWindow.el(`.player[player-id="${downPlayerEntry[0]}"`);
            if(downPlayerEl)
                downPlayerEl.attr("keypress-click", "ArrowDown");
        }
    }
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-player.glsl");
        
        this.socket.on("cancel-question", () => {
            this.cancelQuestion();
        });
        this.socket.on("cancel-damage-select", () => {
            this.closeDamageSelect();
        });
        
        this.socket.on("damage-select-update", info => {
            this.updateDamageSelect(info);
        });
        
        this.socket.on("targeted-damage", info => {
            doc.el("body")
                .crel("div").addc("damage-notification")
                    .txt(info.sender.username+" sent you a penalty of "+info.amount)
                    .anim({
                        opacity: [1, 0],
                        translateY: [0, -50],
                        easing: "linear",
                        duration: 3000
                    });
        })
        
        this.socket.on("state", state => {
            this.prepareView("game");
            
            if(state.self.canSendDamage) {
                doc.el(".streak-info").onclick = () => {
                    this.socket.emit("use-streak");
                    this.cancelQuestion();
                };
            } else {
                doc.el(".streak-info").onclick = null;
            }
            
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
            
            if(state.self.canSendDamage) {
                doc.el(".streak-details").addc("can-send-damage");
                doc.el(".streak-info").attr("keypress-click", "space")
            } else {
                doc.el(".streak-details").remc("can-send-damage")
                doc.el(".streak-info").removeAttribute("keypress-click")
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