
const Player = require("../Player.js");

const { randArr, randInt } = require("../../common/random.js");

class ThieveryPlayer extends Player {
    
    showingQuestion = false;
    
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
                                .filter(player => player.answeredQuestions < this.gameArgs)
                                .length
                        } to reach goal`;
            
            return `Game should end soon`;
        } else {
            return "..."
        }
    }
    
    get info() {
        return {
            id: this.id,
            rank: this.rank,
            username: this.username,
            penaltyQuestions: this.penaltyQuestions,
            answeredQuestions: this.answeredQuestions,
            goalCondition: this.goalCondition,
            streak: this.streak,
            accuracy: this.accuracy
        }
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
    
    addPenaltyQuestions(count) {
        this.penaltyQuestions += count;
        this.socket.emit("add-penalty-questions", count);
        this.socket.emit("penalty-questions", this.penaltyQuestions);
        this.game.emit("update");
    }

    askSpecificQuestion(details) {
        
        this.showingQuestion = true;
        
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
                this.game.emit("update");
                this.sendStateInfo();
                
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
            if(this.game.state === "game")
                this.askQuestion();
            else {
                if(this.showingQuestion) {
                    this.socket.emit("cancel-question");
                    this.showingQuestion = false;
                }
            }
        })
        
        this.game.on("update-players", () => this.sendStateInfo());
        
    }
}

module.exports = ThieveryPlayer;