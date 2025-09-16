class SetEditor {
    
    defaultValue = {
        title: "My Vocabulary Set",
        terms: [
            {hint: "", definition: ""}
        ]
    }
    
    get value() {
        const terms = this.container.els(".vocab-editor-term");
        
        const value = {
            title: this.container.el(".vocab-editor-title").value,
            terms: []
        };
        terms.forEach(termEl => {
            const hintEl = termEl.el(".vocab-editor-hint");
            const defEl = termEl.el(".vocab-editor-definition");
            
            value.terms.push({hint: hintEl.value, definition: defEl.value});
        });
        
        return value;
    }
    
    set value(value) {
        this.container.html("");
        this.container.crel("input")
            .addc("vocab-editor-title")
            .attr("type", "text")
            .attr("placeholder", "Set Title")
            .attr("value", value.title);
        this.container.crel("details")
            .crel("summary").txt("Help: Fast Keyboarding").prnt()
            .crel("p").txt(`
                If you want to be speedy in adding new terms to your set,
                try pressing the ENTER or RETURN key after typing your hint
                or definition. Depending on what comes next, you'll
                automatically be sent to the next box. This makes adding new
                terms as easy as "key" enter "definition" enter "key" enter,
                and so on...
            `).prnt()
            .crel("p").txt(`
                If you make a mistake in a previous box, and wish to go back,
                press SHIFT and ENTER (or RETURN) at the same time. This
                combination of keys will automatically send you to the previous
                text box.
            `).prnt()
        this.container.crel("div")
            .addc("vocab-editor-terms")
        for(let {hint, definition} of value.terms) {
            this.addTerm(hint, definition);
        }
        this.container
            .crel("button")
                .attr("type", "button")
                .txt("Add Another")
                .on("click", () => {
                    this.addTerm("", "");
                })
            .prnt()
            .crel("button")
                .attr("type", "button")
                .txt("Swap Hints/Definitions")
                .on("click", () => {
                    this.swap();
                })
    }
    
    swap() {
        
        for(let term of this.container.els(".vocab-editor-term")) {
            const originalTerm = {
                hint: term.el(".vocab-editor-hint").value,
                definition: term.el(".vocab-editor-definition").value
            }
            
            term.el(".vocab-editor-definition").value = originalTerm.hint;
            term.el(".vocab-editor-hint").value = originalTerm.definition;
        }
        
    }
    
    addTerm(hint = "", definition = "") {
        const termEl = this.container.el(".vocab-editor-terms")
            .crel("div").addc("vocab-editor-term");
        
        const hintEl = termEl
            .crel("input").addc("vocab-editor-hint")
                .attr("placeholder", "Hint")
                .attr("value", hint)
                .on("keydown", event => {
                    if(event.key == "Enter") {
                        event.preventDefault();
                        if(!event.shiftKey) {
                            defEl.focus();
                        } else {
                            let lastTermEl = termEl.previousSibling;
                            if(lastTermEl)
                                lastTermEl.el(".vocab-editor-definition").focus();
                        }
                    }
                });
        
        const defEl = termEl
            .crel("input").addc("vocab-editor-definition")
                .attr("placeholder", "Definition")
                .attr("value", definition)
                .on("keydown", event => {
                    if(event.key == "Enter") {
                        event.preventDefault();
                        if(!event.shiftKey) {
                            const nextTermEl = termEl.nextSibling
                                ? termEl.nextSibling
                                : this.addTerm();
                            
                            nextTermEl.el(".vocab-editor-hint").focus();
                        } else {
                            hintEl.focus();
                        }
                    }
                });
        
        termEl
            .crel("button").addc("vocab-editor-delete-button")
                .attr("type", "button")
                .txt("Remove")
                .on("click", () => termEl.remove());
        
        return termEl;
    }
    
    constructor(container, value = this.defaultValue) {
        this.container = container.addc("set-editor");
        this.value = value;
    }
    
}
export default SetEditor;