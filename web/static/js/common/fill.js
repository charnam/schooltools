
import getSession from "./session.js";
import api from "../api.js";
import { randArr } from "./random.js";

function refill() {
    doc.els("[fill]").forEach(el => {
        if(!el.attr("fill")) return; // don't refill twice
        
        el.html("");
        
        let fill = el.attr("fill");
        
        el.removeAttribute("fill"); // so manual refilling in item-specific code does not crash the browser
        
        switch(fill) {
            case "header":
                el
                    .crel("div").attr("fill", "logo").prnt()
                    .crel("div").addc("right-side")
                        .crel("p").addc("tagline").attr("fill", "header-user-info")
                            .txt("asdfghjkl?")
                        .prnt()
                        .crel("p").addc("links")
                            .crel("a").attr("href", "/misc/")
                                .txt("Miscellaneous").prnt()
                            .crel("a").attr("href", "/vocabsets/")
                                .txt("Vocabulary").prnt()
                            .crel("a").attr("href", "/account/")
                                .txt("Settings").prnt()
                        .prnt()
                    .prnt()
                ;
                refill();
                break;
            case "footer":
                el
                    .txt("Copyleft 2025")
                ;
                break;
            case "logo":
                el.addc("logo")
                    .crel("a").attr("href", "/").addc("logo-title").txt("SchoolTools").prnt()
                    .crel("span").addc("logo-subtitle").txt(
                        randArr([
                            "Memorize terms, quickly and adlessly!",
                            "Tools for your school!",
                            "Advertisement-free!",
                            "Completely FOSS!",
                            "Makes memorization less boring!",
                            "Foreign language classes welcome!",
                            "Ready to help you study!",
                            "Now in your science class!"
                        ])
                    ).prnt()
                ;
                break;
            case "header-user-info":
                el.addc("user-info")
                    .txt("Loading user info...")
                ;
                getSession().then(session => {
                    el.html("");
                    if(!session)
                        el
                            .txt("You are not ")
                            .crel("a").txt("logged in.").attr("href", "/account/login")
                        ;
                    else if(session.isGuest)
                        el
                            .txt("Guest session - ")
                            .crel("a").txt("Log in").attr("href", "/account/login/").prnt()
                            .txt(" now to save your work!")
                        ;
                    else
                        el.txt("You are ").txt(session.user.username).txt(".")
                });
                break;
            case "my-sets":
                el.html("").txt("Loading vocabulary sets...");
                api("sets/my-sets").then(response => {
                    el.html("");
                    if(response.type == "error")
                        el.crel("li").txt("There was an error loading your vocabulary sets.");
                    
                    if(response.sets.length == 0) {
                        el.crel("li").txt("Nothing here. Create some vocabulary sets!");
                    } else {
                        for(let set of response.sets) {
                            el.crel("li").addc("set")
                                .crel("a")
                                    .attr("href", "/vocabsets/view/?id="+set.id)
                                    .txt(set.title)
                                .prnt()
                                .txt(" - Created "+(new Date(set.creation)).toLocaleDateString());
                        }
                    }
                });
                break;
            default:
                el.html("").txt("(unknown fill: "+fill+")");
                break;
        }
        
        el.removeAttribute("fill");
    })
}

export default refill;