
const Player = require("../Player.js");

const { randArr, randInt } = require("../../common/random.js");

class ThieveryPlayer extends Player {
    penaltyQuestions = 0;
    answeredQuestions = 0;
    
    addPenaltyQuestions(count) {
        this.penaltyQuestions += count;
        this.socket.emit("add-penalty", count);
        this.socket.emit("penalty-questions", this.penaltyQuestions);
    }

    askSpecificQuestion(details) {
        this.socket.emit("question", {
            question: details.question,
            answers: details.answers.map(answer => ({text: answer.text}))
        });

        let correctAnswer;
        for(let [btn, answer] in Object.entries(details.answers)) {
            if(answer.isCorrect) {
                correctAnswer = btn;
            }
        }

        this.socket.once("answer", value => {
            if(correctAnswer == value) {
                this.socket.emit("correct");
                this.askQuestion();
                this.game.update();
            } else {
                this.penaltyQuestions += 3;
            }
        });
    }
    askQuestion() {
        const set = this.game.set;
        const currentTerm = randArr(this.game.set.terms);
        
        let answerWith = this.game.gameArgs.answerWith;
        if(answerWith == "both")
            answerWith = randInt(0, 1) ? "definition" : "hint";
        
        const askWith = answerWith == "definition" ? "hint" : "definition";
        
        const question = {
            question: currentTerm[askWith],
            answers: [],
            correctAnswer: randInt(0,3)
        };
        
        const usedTerms = [];
        for(let q = 0; q < 4; q++) {
            if(question.correctAnswer == q) {
                let newTerm = currentTerm;
                
                while(
                    currentTerm == newTerm &&
                    !usedTerms.includes(newTerm)
                ) { // make sure we aren't getting two correct / same answers
                    newTerm = getRandomTerm(set);
                }
                
                usedTerms.push(newTerm);
                answers.push({text: newTerm[answerWith]});
            } else {
                answers.push({text: currentTerm[answerWith]});
            }
        }
        this.askSpecificQuestion(question);
    }

    constructor(...args) {
        super(...args);
    }
}

module.exports = ThieveryPlayer;