import DefaultViews from "./DefaultViews.js";

class PlayerViews extends DefaultViews {
    
    static entry_loading() {
        doc.el("#entry_loading").addc("entry")
            .crel("p");
    }
    static entry_username() {
        doc.el("#entry_username").addc("entry")
            .crel("p").txt("Username").prnt()
            .crel("input")
                .attr("id", "username-input")
                .addc("entry-input")
                .attr("type", "text")
                .attr("pattern", "[a-zA-Z0-9\\s]{3,15}")
    }
    static entry_joincode() {
        doc.el("#entry_joincode").addc("entry")
            .crel("p").txt("Join Code").prnt()
            .crel("input")
                .attr("id", "joincode-input")
                .addc("entry-input")
                .attr("type", "number")
    }
    
    static pregame() {
        doc.el("#pregame")
            .crel("div").attr("id", "pregame-message")
                .txt("You're in! Wait patiently for the game to start...")
            .prnt()
    }
    
}

export default PlayerViews;