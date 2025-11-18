import PlayerViews from "../views/PlayerViews.js";

class ThieveryPlayerViews extends PlayerViews {
    
    static pregame() {
        let srcs = [
            "/static/images/game-explanation-2.png",
            "/static/images/game-explanation.png",
            "/static/images/game-explanation-3.png",
        ];
        
        const pregame = doc.el("#pregame")
            .crel("div").attr("id", "pregame-message")
                //.txt("You're in! Get ready...")
            
        const cycle_img = () => {
            const src = srcs.shift();
            srcs.push(src);
            img.src = src;
        };
        
        const img = pregame
            .crel("img").addc("pregame-explanation")
                .attr("draggable", "false")
                .on("click", () => cycle_img())
                .attr("src", "");
        
        cycle_img();
    }
    
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