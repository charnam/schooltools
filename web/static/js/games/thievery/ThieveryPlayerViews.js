import PlayerViews from "../views/PlayerViews.js";

class ThieveryPlayerViews extends PlayerViews {
    
    static game() {
        doc.el("#game")
            .crel("div").attr("id", "stats-bar")
                .crel("div").addc("streak-details")
                    .crel("div").addc("streak-bars").prnt()
                    .crel("div").addc("streak-info")
                        .txt("Press SPACE to send damage")
                    .prnt()
                .prnt()
                .crel("div").addc("center-info")
                    .crel("div").addc("stat-rank").prnt()
                .prnt()
                .crel("div").addc("right-info").prnt()
    }
    
}


export default ThieveryPlayerViews;