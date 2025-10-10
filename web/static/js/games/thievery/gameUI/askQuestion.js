
function askQuestion(game, details) {
    const questionContainer =
        doc.el("#game")
            .crel("div").addc("question")
                .crel("div").txt(details.question).prnt()
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
                    .on("click", () => {
                        game.socket.emit("answer", buttonid);
                        clickedButton = button
                    });
                .prnt()
    }
    this.socket.once("answer-result", () => {
        questionContainer
    })
}

export default askQuestion;
