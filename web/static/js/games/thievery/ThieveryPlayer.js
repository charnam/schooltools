
import Player from "../Player.js";
import setWallpaper from "../wallpaper.js";
import askQuestion from "./gameUI/askQuestion.js";
import ThieveryPlayerViews from "./ThieveryPlayerViews.js";

class ThieveryPlayer extends Player {
    Views = ThieveryPlayerViews;
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-player.glsl");
        
        askQuestion({
            question: "hello",
            answers: [
                {text: "answer 1"},
                {text: "answer 2"},
                {text: "answer 3"},
                {text: "answer 4"},
            ]
        })
    }
}

export default ThieveryPlayer;