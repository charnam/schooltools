import api from "/static/js/api.js";
import GameClient from "./GameClient.js";
import PlayerViews from "./views/PlayerViews.js";

class Player extends GameClient {
    
    Views = PlayerViews;
    
    async testJoinCode() {
        
        this.show_loader("Checking code...")

        const code = doc.el("#joincode-input").value;

        let response = await api("games/thievery/testcode", {
            joincode: code
        });
        
        if(response.type == "success") {
            this.joinArgs.joincode = code;
            if(this.joinArgs.username) {
                this.connect();
            } else {
                this.view = "entry_username";
            }
        } else {
            this.show_error("Invalid join code.");
            setTimeout(() => this.view = "entry_joincode", 1000);
        }
    }
    
    constructor(namespace, args) {
        const query = new URLSearchParams(window.location.search);
        let autoconnect = false;
        const joincode = query.get("joincode");
        const username = query.get("username");

        if(username && joincode)
            autoconnect = true;

        super(namespace, {
            type: "play",
            autoconnect,
            joincode,
            username,
            ...args
        });
        
        this.prepareView("entry_joincode");
        this.prepareView("entry_username");
        
        const joincodeInput = doc.el("#joincode-input");
        joincodeInput.on("keydown", async (event) => {
            if(event.key !== "Enter") return;
            
            await this.testJoinCode();
        });

        const usernameInput = doc.el("#username-input");
        usernameInput.on("keydown", (event) => {
            if(event.key !== "Enter") return;
            
            if(usernameInput.validity && usernameInput.validity.patternMismatch) {
                this.show_error("Your username was red! Before pressing ENTER, make sure you don't have any symbols in your name, and that it is between 3 and 16 characters long.");
                setTimeout(() => this.view = "entry_username", 4000);
            } else {
                this.joinArgs.username = usernameInput.value;
                this.connect();
            }
        });

        if(!autoconnect) {
            if(!joincode) {
                this.view = "entry_joincode";
            } else if(!username) {
                this.view = "entry_username";
            } else {
                this.show_error("I don't know how you got this error. What?");
            }
        }
        
    }
}

export default Player;