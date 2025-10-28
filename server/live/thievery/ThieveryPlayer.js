
const Player = require("../Player.js");

const { randArr, randInt } = require("../../common/random.js");

class ThieveryPlayer extends Player {
    
    showingQuestion = false;
    inDamageSelect = false;
    
    penaltyQuestions = 0;
    answeredQuestions = 0;
    totalAnswered = 0; // Total questions answered, disregarding any penalties
    streak = 0;
    answeredResults = []; // Array used to generate accuracy
    
    get rank() {
        return this.game.rankedPlayers.indexOf(this) + 1;
    }
    
    get goalCondition() {
        if(this.game.gameArgs.endAt.type == "questions") {
            if(this.answeredQuestions < this.game.gameArgs.endAt.value)
                return `${Number(this.game.gameArgs.endAt.value) - this.answeredQuestions + this.penaltyQuestions} left to reach goal`;
            
            if(this.game.gameArgs.endAt.everyone)
                return `Waiting on ${
                            Object.values(this.game.players)
                                .filter(player => player.answeredQuestions < this.game.gameArgs.endAt.value)
                                .length
                        } to reach goal`;
            
            return `Game should end soon`;
        } else {
            return "..."
        }
    }
    
    get canSendDamage() {
        return this.game.state == "game" && this.streak >= this.game.sendPenaltyMinimumStreak && !this.inDamageSelect;
    }
    
    get info() {
        return {
            id: this.id,
            rank: this.rank,
            username: this.username,
            penaltyQuestions: this.penaltyQuestions,
            answeredQuestions: this.answeredQuestions,
            canSendDamage: this.canSendDamage,
            goalCondition: this.goalCondition,
            streak: this.streak,
            accuracy: this.accuracy,
            inDamageSelect: this.inDamageSelect
        };
    }
    
    get damageInfo() {
        return {
            rank: this.rank,
            username: this.username,
            penaltyQuestions: this.penaltyQuestions,
            answeredQuestions: this.answeredQuestions
        };
    }
    
    get accuracy() {
        return this.answeredResults.reduce((a,b) => a + b, 0) / this.answeredResults.length;
    }
    
    sendStateInfo() {
        this.socket.emit("state", {
            self: this.info,
            game: this.game.info
        });
    }
    sendDamageSelectInfo() {
        this.socket.emit("damage-select-update", this.game.damageInfo);
    }
    
    addPenaltyQuestions(count) {
        this.penaltyQuestions += count;
        this.socket.emit("add-penalty-questions", count);
        this.socket.emit("penalty-questions", this.penaltyQuestions);
        this.game.emit("update");
        this.sendStateInfo();
    }
    
    receiveTargetedDamage(sender, amount) {
        this.addPenaltyQuestions(amount);
        this.socket.emit("targeted-damage", {
            sender: {
                username: sender.username
            },
            amount
        });
    }

    askSpecificQuestion(details) {
        
        const questionId = Date.now();
        this.showingQuestion = questionId;
        
        this.socket.emit("question", {
            question: details.question,
            answers: details.answers.map(answer => ({text: answer.text}))
        });
        
        let correctAnswer;
        for(let [btn, answer] of Object.entries(details.answers)) {
            if(answer.isCorrect) {
                correctAnswer = btn;
            }
        }

        this.socket.once("answer", value => {
            if(this.showingQuestion !== questionId) return;
            
            this.showingQuestion = false;
            
            if(correctAnswer == value) {
                this.socket.emit("answer-result", true);
                
                const oldRank = this.rank;
                if(this.penaltyQuestions > 0)
                    this.penaltyQuestions--;
                else {
                    this.answeredQuestions++;
                    this.streak++;
                }
                this.totalAnswered++;
                
                this.game.emit("update");
                this.sendStateInfo();
                
                if(this.rank > oldRank || this.rank < oldRank) {
                    this.game.emit("update-players");
                }
                
                this.askQuestion();
            } else {
                this.socket.emit("answer-result", false);
                this.streak = 0;
                this.addPenaltyQuestions(3);
                this.askQuestion();
            }
        });
    }
    askQuestion() {
        const set = this.game.set;
        const currentTerm = randArr(this.game.set.terms);
        
        let answerWith = this.game.gameArgs.answerWith;
        if(answerWith == "both")
            answerWith = randInt(0, 1) ? "definition" : "hint";
        
        // The askWith variable is inverse of answerWith
        const askWith = answerWith == "definition" ? "hint" : "definition";
        
        const question = {
            question: currentTerm[askWith],
            answers: [],
        };
        
        const usedTerms = [currentTerm];
        const correctAnswer = randInt(0,3)
        for(let q = 0; q < 4; q++) {
            if(correctAnswer !== q) {
                let newTerm = null;
                
                // make sure we aren't getting two correct / same answers
                while(newTerm == null || usedTerms.includes(newTerm)) {
                    newTerm = randArr(this.game.set.terms)
                }
                
                usedTerms.push(newTerm);
                question.answers.push({
                    text: newTerm[answerWith]
                });
            } else {
                question.answers.push({
                    text: currentTerm[answerWith],
                    isCorrect: true
                });
            }
        }
        this.askSpecificQuestion(question);
    }

    constructor(...args) {
        super(...args);
        
        this.game.on("statechange", () => {
            if(this.game.state === "game") {
                this.askQuestion();
                this.sendStateInfo();
            } else {
                if(this.showingQuestion) {
                    this.socket.emit("cancel-question");
                    this.showingQuestion = false;
                }
                if(this.inDamageSelect) {
                    this.socket.emit("cancel-damage-select");
                    this.inDamageSelect = false;
                }
            }
        });
        
        this.game.on("update-players", () => this.sendStateInfo());
        
        this.game.on("update", () => {
            if(this.inDamageSelect) {
                this.sendDamageSelectInfo();
            }
        });
        
        this.socket.on("use-streak", () => {
            if(this.canSendDamage) {
                this.streak -= 3;
                this.showingQuestion = false;
                this.inDamageSelect = true;
                this.sendStateInfo();
                this.sendDamageSelectInfo();
                
                const receiveDamage = playerId => {
                    if(!this.game.players[playerId] || playerId == this.id) {
                        this.sendDamageSelectInfo();
                        return;
                    }
                    
                    this.socket.off("send-damage", receiveDamage);
                    
                    this.game.toSpectators.emit("player-attacks-player", {
                        from: this.id, 
                        to: playerId
                    });
                    
                    this.inDamageSelect = false;
                    setTimeout(() => {
                        this.askQuestion();
                        this.sendStateInfo();
                        this.game.players[playerId].receiveTargetedDamage(this, 2);
                    }, 500);
                };
                
                this.socket.on("send-damage", receiveDamage);
            }
        })
        
    }
}

module.exports = ThieveryPlayer;