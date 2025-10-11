
const Player = require("../Player.js");

const { randArr, randInt } = require("../../common/random.js");

class ThieveryPlayer extends Player {
    
    showingQuestion = false;
    penaltyQuestions = 0;
    answeredQuestions = 0;
    
    addPenaltyQuestions(count) {
        this.penaltyQuestions += count;
        this.socket.emit("add-penalty-questions", count);
        this.socket.emit("penalty-questions", this.penaltyQuestions);
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
                this.game.emit("update");
                this.askQuestion();
            } else {
                this.socket.emit("answer-result", false);
                this.addPenaltyQuestions(3);
                this.game.emit("update");
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
        
        // askWith: inverse of answerWith
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
        
    }
}

module.exports = ThieveryPlayer;