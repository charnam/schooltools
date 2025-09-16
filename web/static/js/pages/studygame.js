class StudyGame {
    
    correctAnswer = 0
    readyToShowNext = false
    canAnswer = false
    streak = 0
    
    answerHistory = [
        
    ]
    
    addAnswerBox(container, id, answer) {
        container
            .crel("div").addc("answer-button")
                .on("mousedown", (event) => {
                    this.answer(id)
                    event.preventDefault();
                })
                .on("touchstart", event => {
                    event.preventDefault();
                    this.answer(id);
                })
                .attr("button-id", id)
                .txt(answer);
    }
    
    ask(details) {
        /*
            details:
            {
                question: "How tall are you?",
                answers: [
                    "Four feet",
                    "Eleven feet",
                    "Eight feet",
                    "Twelve hundred meters"
                ],
                correctAnswer: 3 // "Twelve hundred meters"
            }
        */
        
        this.container.remc("can-proceed");
        this.readyToShowNext = false;
        
        const c = this.container;
        this.correctAnswer = details.correctAnswer;
        
        const q = c
            .el(".question-wrapper")
                .html("");
        
        q
            .crel("div")
                .addc("question")
                .txt(details.question);
            
        const answers = q
            .crel("div")
                .addc("answers")
        
        const toprow = answers
            .crel("div")
                .addc("row");
        
        this.addAnswerBox(toprow, 0, details.answers[0]);
        this.addAnswerBox(toprow, 1, details.answers[1]);
        
        const bottomrow = answers
            .crel("div")
                .addc("row");
        
        this.addAnswerBox(bottomrow, 2, details.answers[2]);
        this.addAnswerBox(bottomrow, 3, details.answers[3]);
        
        c.el(".question")
            .anim({
                opacity: [0, 1],
                translateX: [this.fastModeEnabled ? 100 : 300, 0],
                duration: this.fastModeEnabled ? 100 : 300,
                easing: "ease-out",
            });
                
        c.els(".answer-button")
            .anim({
                translateY: [80, 0],
                opacity: [0, 1],
                duration: this.fastModeEnabled ? 100 : 200,
                delayBetween: 10,
                easing: "ease-out"
            })
            
        this.canAnswer = true;
    }
    async answer(buttonid) {
        if(!this.canAnswer) return false;
        this.canAnswer = false;
        
        const button = this.container.el("[button-id='"+buttonid+"']")
        if(!button) return false;
        const correctButton = this.container.el("[button-id='"+this.correctAnswer+"']")
        
        const sfx = new Audio();
        sfx.autoplay = true;
        
        
        if(this.correctAnswer == buttonid || (button.innerText.trim().toLowerCase()) == (correctButton.innerText.trim().toLowerCase())) {
            
            if(this.answerHistory.length > 0 && this.answerHistory[this.answerHistory.length-1].timestamp > Date.now() - 3000)
                this.streak++;
            else
                this.streak = 0;
            sfx.src = "/static/audio/ans"+((this.streak%7)+1)+".mp3";
            
            if(navigator.vibrate)
                navigator.vibrate([30, 100]);
            
            this.container.style.animation = "";
            this.container.scrollWidth; // force reflow to make animation function properly
            this.container.style.animation = `correctAnswer ${this.fastModeEnabled ? 0.2 : 0.5}s ease-out`;
            
            this.answerHistory.push({
                correct: true,
                timestamp: Date.now()
            });
            
            button
                .addc("chosen-correct")
                .anim({
                    scale: [1, 0.6, 1.2, 1],
                    easing: "ease-out",
                    duration: 300,
                    delayBetween: 80
                });
                
            this.container
                .els(".answer-button:not([button-id='"+buttonid+"'])")
                    .anim({
                        scale: [1, 0],
                        easing: "ease-out",
                        duration: 100,
                        delayBetween: 40
                    });
            this.container.addc("can-proceed");
            this.readyToShowNext = true;
            
            setTimeout(() => this.showNext(), this.fastModeEnabled ? 0 : 300);
            
            
        } else {
            this.streak = 0;
            sfx.src = "/static/audio/incorrect.mp3";
            
            if(navigator.vibrate)
                navigator.vibrate([100, 40, 100]);
            
            this.answerHistory.push({
                correct: false,
                timestamp: Date.now()
            });
            button.addc("chosen-incorrect");
            button
                .anim({
                    translateX: [20, -10, 6, -3, 2, 0],
                    easing: "ease-out",
                    duration: 300
                })
            
            this.container.el("[button-id='"+this.correctAnswer+"']").addc("not-chosen-correct");
            
            const endTime = Date.now()+3000;
            while(this.updateTimer(endTime)) {
                await new Promise(res => setTimeout(res, 10)); // 10ms delay
            }
            
            this.container.addc("can-proceed");
            this.readyToShowNext = true;
        }
        
        
        
    }
    showNext() {
        if(this.readyToShowNext) {
            this.container.remc("can-proceed");
            this.readyToShowNext = false;
            this.container.el(".answers")
                .anim({
                    opacity: [1, 0],
                    easing: "ease-in",
                    duration: this.fastModeEnabled ? 100 : 300
                })
            this.container.el(".question")
                .anim({
                    opacity: [1, 0],
                    translateX: [0, this.fastModeEnabled ? -100 : -300],
                    easing: "ease-in",
                    duration: this.fastModeEnabled ? 100 : 300
                }).onfinish(() =>
                    this.onNextQuestion(this)
                )
        }
    }
    updateTimer(endTime) {
        if(endTime < Date.now()) {
            this.container.removeAttribute("timer");
            return false;
        } else {
            this.container.attr("timer", Math.round((endTime - Date.now()) / 100) / 10);
            return true;
        }
    }
    
    fastModeEnabled = false
    fastModeUpdate = 0
    
    updateStats() {
        const statsEl = this.container.el(".statistics");
        
        let currentStats;
        
        if(this.fastModeUpdate > Date.now() - 1000) {
            
            currentStats = "Faster animations: "+this.fastModeEnabled;
            
        } else {
            
            const accuracy = Math.round(this.answerHistory.filter(answer => answer.correct).length / this.answerHistory.length * 100);
            const timeBetween = [];
            let lastTimestamp = null;
            for(let {timestamp} of this.answerHistory) {
                if(lastTimestamp !== null)
                    timeBetween.push(timestamp - lastTimestamp);
                lastTimestamp = timestamp;
            }
            
            const apm = 1 / ((timeBetween.reduce((a,b) => a+b)/timeBetween.length) / 60000);
            
            const apm_formatted = Math.round((apm) * 1000) / 1000;
            
            let streakText = "";
            
            if(this.answerHistory.length > 0 && this.streak > 0) {
                let streakTimeout = Math.round((this.answerHistory[this.answerHistory.length - 1].timestamp - Date.now() + 3000) / 100) / 10;
                if(streakTimeout > 0)
                    streakText = `Streak: ${this.streak} (${streakTimeout}s)`
            }
            
            currentStats = 
                    `${this.answerHistory.length} answered
                    ${accuracy}% accuracy
                    ${apm_formatted} <abbr title='Answers per Minute' class='apm-btn'>APM</abbr>
                    ${streakText}`;
        }
        
        statsEl.html(currentStats);
        let apmBtn = statsEl.el(".apm-btn")
        if(apmBtn)
            apmBtn.on("mousedown", () => {
                this.fastModeEnabled = !this.fastModeEnabled;
                this.fastModeUpdate = Date.now();
            })
    }
    
    constructor(container, nextQuestion) {
        this.container = container.addc("study-game").html("");
        this.onNextQuestion = nextQuestion;
        
        const c = container;
        
        c.crel("div").addc("statistics")
        
        setInterval(() => this.updateStats(), 100);
        
        c.crel("div").addc("question-wrapper");
        
        
        window.addEventListener("keydown", event => {
            if(document.activeElement == document.body) {
                let key = event.key;
                if(key == "i")
                    key = "1"
                if(key == "o")
                    key = "2"
                if(key == "k")
                    key = "3"
                if(key == "l")
                    key = "4"
                
                let keyNum = Number(key);
                if([1,2,3,4].includes(keyNum)) {
                    this.answer(keyNum-1);
                }
                if(key == " ") {
                    this.showNext()
                }
                
                if(key == "f")
                    c.requestFullscreen();
            }
        });
        
        this.container.on("click", () => {
            this.showNext();
        })
    }
}

export default StudyGame;