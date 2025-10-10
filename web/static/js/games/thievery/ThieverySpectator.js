import Spectator from "../Spectator.js";
import setWallpaper from "../wallpaper.js";
import ThieverySpectatorViews from "./ThieverySpectatorViews.js";

class ThieverySpectator extends Spectator {
    Views = ThieverySpectatorViews;
    
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-leaderboard.glsl");
    }
}

export default ThieverySpectator;