
const { error, success } = require("../../common/states.js");
const { getSet } = require("../../common/sets.js");
const register_live = require("../register-live.js");
const register = require("../../routes/register-routes.js");
const ThieveryGame = require("./ThieveryGame.js");
const ThieveryPlayer = require("./ThieveryPlayer.js");
const ThieverySpectator = require("./ThieverySpectator.js");

const runningGames = {};
const joinCodes = {};

register({
    "games": {
        "thievery": {
            "create": {
                requirements: {
                    endtype: "string",
                    endvalue: value => value > 0 ? success() : error("Question / minute end value is not a number greater than 0"),
                    set: "string",
                    // TODO: add automatic requirements check for these sort of "enum" values
                    answerwith: value => ["both", "answers", "definition"].includes(value)
                                    ? success() : error("answerwith must be both, answers, or definition"),
                    damage: value => ["disabled", "random", "targeted"].includes(value)
                                ? success() : error("damage must be disabled, random, or targeted")
                },
                func: async body => {
                    let gameArgs = {
                        endAt: {
                            type: "questions",
                            value: 30,
                            everyone: false
                        },
                        answerWith: "both",
                        penalties: true,
                        damage: "targeted"
                    };
                    
                    gameArgs.answerWith = body.answerwith;
                    gameArgs.damage = body.damage;
                    if(body.penalties) {
                        gameArgs.penalties = true;
                    } else {
                        gameArgs.penalties = false;
                    }
                    
                    if(body.endtype == "questions" || body.endtype == "questions_everyone")
                        if(
                            body.endvalue % 1 == 0 &&
                            body.endvalue > 5 &&
                            body.endvalue <= 500
                        ) {
                            gameArgs.endAt = {
                                type: "questions",
                                value: body.endvalue,
                                everyone: body.endtype == "questions_everyone"
                            };
                        } else {
                            return error("Target question count must be a whole number from 5 to 500");
                        }
                    
                    if(body.endtype == "minutes")
                        if(
                            body.endvalue % 1 == 0 &&
                            body.endvalue > 1 &&
                            body.endvalue < 60
                        ) {
                            gameArgs.endAt = {
                                type: "minutes",
                                value: body.endvalue
                            };
                        } else {
                            return error("Target game length must be a whole number, from 1 to 60")
                        }
                    
                    if(gameArgs.penalties == false)
                        gameArgs.damage = "disabled";
                    
                    const set = await getSet({id: body.set});
                    if(!set)
                        return error("Provided set does not exist or is not public");
                    
                    if(set.terms.length < 4)
                        return error("The vocabulary set needs at least 4 terms in order to start a live game");

                    let game = new ThieveryGame(set, body);

                    runningGames[game.id] = game;
                    joinCodes[game.joincode] = game.id;

                    game.onceEnded = () => runningGames[game.id] = null;
                    return success({gameid: game.id, moderationKey: game.moderationKey});
                }
            }
        }
    }
});

register_live({
    "games/thievery": {
        handler: (socket, session, requestDetails) => {
            if(requestDetails.type == "spectate") {
                const game = runningGames[requestDetails.gameid]; // Find game by ID for spectators
                if(!game) return error("Invalid game ID");
                
                const spectator = new ThieverySpectator(socket, game, requestDetails, session);
                game.addSpectator(spectator);
            } else if(requestDetails.type == "play") {
                let game = runningGames[joinCodes[requestDetails.joinCode]]; // Find game by join code for players
                if(!game) return error("Invalid join code");
                
                if(game.state == "pregame") {
                    const player = new ThieveryPlayer(socket, game, requestDetails, session);
                    game.addPlayer(player);
                } else {
                    return error("Game has already started. Mid-game joining could be added later?");
                }
            } else {
                return error("Invalid game type");
            }
            return success();
        }
    }
})
