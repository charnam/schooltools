const io = require('../io.js');
const EventEmitter = require('events');
const Player = require("./Player.js");
const Spectator = require("./Spectator.js");

const mkid = require("uuid").v4;

class Game extends EventEmitter {
    
    id = null;
    joincode = null;
    _state = "pregame";
    
    set state(value) {
        this._state = value;
    }
    get state() {
        return this._state;
    }

    players = [];
    spectators = [];
    moderationKey = null;

    toClients = null;
    toPlayers = null;
    toSpectators = null;

    // Implemented by classes inheriting this one.
    handleNewPlayer(player) {}
    handleNewSpectator(spectator) {}

    addPlayer(player) {
        this.players.push(player);
        player.socket.join(this.id);
        player.socket.join("players");
        this.handleNewPlayer(player);
        player.emit("gamestate", this.state);
        return player;
    }

    addSpectator(spectator) {
        this.spectators.push(spectator);
        spectator.socket.join(this.id);
        spectator.socket.join("spectators");
        this.handleNewSpectator(spectator);
        return spectator
    }
    
    async countDown() {
        const countDownSec = secondsLeft => new Promise(async res => {
            if(secondsLeft > 0) {
                this.toClients.emit("countdown", secondsLeft);
                await countDownSec(secondsLeft-1);
            }
            res();
        });
        
        await countDownSec(3);
    }
    
    countDownToStart() {
        this.state = "counting_down";
        
        this.countDown().then(() => {
            this.start();
        });
    }
    
    start() {
        this.state = "started";
    }
    
    constructor() {
        super();
        
        this.id = mkid();
        this.joincode = Math.floor(Math.random() * 899999 + 100000);
        this.moderationKey = mkid();

        this.toClients = io.of("/games/thievery").to(this.id);
        
        this.toPlayers = this.toClients.to("players");
        this.toSpectators = this.toClients.to("spectators");
        
        
        this.on("started", () => {
            this.toClients.emit("gameStarted")
        })
    }
}

module.exports = Game;