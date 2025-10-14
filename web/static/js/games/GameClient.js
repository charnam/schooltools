import "/socket.io/socket.io.min.js";
import DefaultViews from "./views/DefaultViews.js";

class GameClient {
    
    socket = null;
    currentState = {}; // temporary values would go here
    playingSounds = {};
    
    Views = DefaultViews;
    
    hideCurrentView() {
        let currentlyVisible = doc.els("#view-wrapper > .visible")
        for(let view of currentlyVisible) {
            view.remc("visible");
            document.activeElement.blur();
        }
    }
    
    createSound(filename) {
        let aud = new Audio();
        aud.src = "/static/audio/live/"+filename;
        return aud;
    }
    
    playSound(filename, id = null) {
        return new Promise(res => {
            let aud = this.createSound(filename);
            aud.autoplay = true;
            
            if(id !== null)
                this.playingSounds[id] = aud;
            
            aud.onended = () => {
                if(this.playingSounds[id] == aud)
                    delete this.playingSounds[id];
                
                aud.remove();
                
                res();
            }
        })
    }
    
    
    prepareView(id) {
        if(!doc.el("#view-wrapper > #"+id)) {
            doc.el("#view-wrapper")
                .crel("div")
                    .attr("id", id);
            
            if(typeof this.Views[id] == "function") {
                this.Views[id](this);
            }
        }
    }
    
    set view(value) {
        this.hideCurrentView();
        this._view = value;
        let newView = doc.el("#"+value);
        if(newView)
            newView.addc("visible")
        else {
            this.prepareView(value);
            newView = doc.el("#"+value)
            newView.scrollWidth;
            setTimeout(() => {
                this.hideCurrentView();
                newView.addc("visible")
            }, 10);
        }
    }
    
    get view() {
        return this._view;
    }

    show_error(text) {
        this.view = "server_error";
        doc.el("#error-message")
            .html("").txt(text);
    }
    show_loader(text) {
        this.view = "entry_loading";
        doc.el("#entry_loading p")
            .html("").txt(text);
    }
    
    connect() {
        this.socket.io.opts.query = this.joinArgs;
        
        this.socket.connect();
    }
    
    constructor(namespace, args) {
        this.joinArgs = {
            namespace,
            autoconnect: args.type == "spectate",
            ...args
        };
        
        this.prepareView("game");
        
        this.socket = io(
            namespace,
            {
                autoConnect: this.joinArgs.autoconnect,
                query: this.joinArgs
            }
        );
        
        this.socket.on("server-disconnect", err => {
            this.show_error(err)
        });
        
        this.socket.on("gamestate", state => {
            this.view = state;
        });
        
        this.socket.on("countdown", value => {
            doc.el("#counting_down")
                .crel("div").addc("countdown-digit")
                    .txt(value)
                    .anim({
                        scale: [0.6, 1.0, 1.2, 1.4],
                        easing: "linear",
                        opacity: [0, 1, 1, 0],
                        duration: 1300
                    })
        });
        
    }
}

export default GameClient;