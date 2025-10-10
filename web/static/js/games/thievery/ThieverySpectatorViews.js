import SpectatorViews from "../views/SpectatorViews.js";

class ThieverySpectatorViews extends SpectatorViews {
    
    static pregame() {
        doc.el("#pregame")
            .crel("div").attr("id", "pregame-sidebar")
                .crel("div").attr("id", "joincode").prnt()
            .prnt()
            .crel("div").attr("id", "pregame-main")
                .crel("div").attr("id", "pregame-header-bar")
                    .crel("div").attr("id", "pregame-header-players").prnt()
                    .crel("button").attr("id", "startgame").addc("moderator-only")
                        .txt("Start Game")
                    .prnt()
                .prnt()
                .crel("div").attr("id", "pregame-players-list")
                .prnt()
            .prnt();
    }
    
}


export default ThieverySpectatorViews;