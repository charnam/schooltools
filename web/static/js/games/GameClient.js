import {connect} from "./connections.js";

class GameClient {
    hideCurrentView() {
        let currentlyVisible = doc.els("#view-wrapper > .visible")
        for(let view of currentlyVisible) {
            view.remc("visible");
        }
    }
    
    set view(value) {
        this.hideCurrentView();
        this._view = value;
        let newView = doc.el("#view-wrapper > #"+value);
        if(newView)
            newView.addc("visible")
        else
            console.warn("Warning: View set to unknown value "+value);
    }
    
    get view() {
        return this._view;
    }
    
    constructor(namespace, args) {
        const params = new URLSearchParams(window.location.search);
        this.socket = connect(namespace, {
            gameid: params.get("id"),
            ...args
        });
        
        this.socket.on("connect", () => console.log("Connected"));
        
        this.socket.on("server-disconnect", err => {
            this.view = "server-error";
            doc.el("#view-wrapper")
                .el("#server-error").addc("visible")
                    .el("#server-error-message").html("").txt("Error: "+err);
        });
        
        this.socket.on("gamestate", state => {
            this.view = state;
        });
    }
}

export default GameClient;