class Flashcards {
    
    set card(value) {
        let card = this.container
            .el(".card:nth-child("+(Number(value)+1)+")");
        if(!card) return false;
        
        this._card = value;
        
        for(let selectedCard of this.container.els(".card.selected"))
            selectedCard.remc("selected");
        
        this.container
            .attr("card", value)
            .attr("style", "--card: "+value);
        
        card.addc("selected");
        this.updateLabel();
        
        this.flipped = false;
    }
    
    get card() {
        return Number(this._card);
    }
    
    set flipped(value) {
        this._flipped = value;
        if(value)
            this.container.addc("flipped");
        else
            this.container.remc("flipped");
        
        return value;
    }
    get flipped()  {
        return this._flipped;
    }
    
    set cards(cards) {
        this._cards = cards;
        
        const c = this.container;
        c.html("");
        
        
        for(let cardIndex in cards) {
            let card = cards[cardIndex];
            const cardEl = c
                .crel("div")
                    .addc("card")
                    .on("click", () => {
                        if(this.card == cardIndex) {
                            this.flipped = !this.flipped;
                        } else {
                            this.card = cardIndex;
                        }
                    });
            
            cardEl.crel("div").addc("card-hint").txt(card.hint);
            cardEl.crel("div").addc("card-definition").txt(card.definition);
        }
        
        this.updateLabel();
        
        return cards;
    }
    
    get cards()  {
        return this._cards;
    }
    
    updateLabel() {
        
        this.container.els(".card-count").forEach(el => el.remove());
        
        this.container.crel("div").addc("card-count").attr("style", `--progress: ${(this.card+1) / this.cards.length * 100}%`)
            .txt("Card "+(this.card+1)+" of "+this.cards.length);
        
    }
    
    lastCard() {
        if(this.card - 1 >= 0)
            return --this.card;
        else
            return this.card;
    }
    nextCard() {
        if(this.cards.length > this.card + 1)
            return ++this.card;
        else
            return this.card;
    }
    
    constructor(container, cards = []) {
        this.container = container.addc("flashcards").html("");
        
        const c = container;
        this.cards = cards;
        
        this.flipped = false;
        this.card = 0;
        
        window.addEventListener("keydown", event => {
            let key = event.key;
            if(key == "ArrowLeft")
                key = "left";
            if(key == "ArrowRight")
                key = "right";
            
            if(key == "left")
                this.lastCard();
            if(key == "right")
                this.nextCard();
            if(key == " ") {
                this.flipped = !this.flipped;
                event.preventDefault();
            }
        })
    }
}

export default Flashcards;