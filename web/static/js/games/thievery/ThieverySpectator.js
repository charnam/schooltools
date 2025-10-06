import Spectator from "../Spectator.js";
import setWallpaper from "../wallpaper.js";


class ThieverySpectator extends Spectator {
    constructor(args) {
        super("/games/thievery", args);
        
        setWallpaper("thievery-leaderboard.glsl");
    }
}

export default ThieverySpectator;