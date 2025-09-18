
import StudyGame from "./studygame.js";
import {randArr, randInt} from "/static/js/common/random.js";

class StudyVocabGame extends StudyGame {
    
    questionmode = "random"
    
    vocabNextQuestion() {
        
        const correctTerm = randArr(this.vocabSet.terms);
        let otherTerms = this.vocabSet.terms.filter(term => term !== correctTerm);
        let qmode = this.questionmode;
        if(qmode == "random")
            qmode = randArr(["hint", "definition"]);
        
        const amode = (qmode == "hint" ? "definition" : "hint");
        
        const foolAnswers = [
            
        ];
        for(let i = 0; i < 3; i++) {
            const answerTerm = randArr(otherTerms);
            otherTerms = otherTerms.filter(term => term !== answerTerm);
            
            const answer = answerTerm[amode];
            foolAnswers.push(answer);
        }
        
        const answers = [];
        
        let correctAnswerPosition = randInt(0,4);
        for(let i = 0; i < 4; i++) {
            if(correctAnswerPosition == i)
                answers.push(correctTerm[amode]);
            
            if(foolAnswers[i])
                answers.push(foolAnswers[i]);
        }
        
        this.ask({
            question: correctTerm[qmode],
            answers,
            correctAnswer: correctAnswerPosition
        })
        
    }
    
    constructor(container, vocabSet) {
        super(container, () => this.vocabNextQuestion(), false);
        this.vocabSet = vocabSet;
        this.vocabNextQuestion();
    }
    
}


export default StudyVocabGame;