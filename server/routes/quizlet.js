

const register = require("./register-routes.js");
const { error, success } = require("../common/states.js");

const bcrypt = require("bcrypt");
const https = require('node:https');
const http = require('node:http');
const fs = require("fs");

const headersFromBrowser =
    Object.fromEntries(fs.readFileSync("./config/quizlet-headers.txt").toString()
        .split("\n").map(header => header.split(":").map(entry => entry.trim())));

const testmode = false;
register({
    "other": {
        "quizlet-get": {
            requirements: {
                path: "string"
            },
            func: body => {
                
                let path = body.path.split("/");
                
                let allow = false;
                path = path.filter((item) => {
                    if(item == "quizlet.com") {
                        allow = true;
                        return false;
                    }
                    if(!allow) return false;
                    if(item.trim() == "") return false;
                    return true;
                });
                

                return new Promise(respond => {
                    try {
                        if(path.length == 0) return respond(error("Link cannot be empty"));
                        
                        const req = (testmode ? http : https).request({
                            method: "GET",
                            host: testmode ? "localhost" : "quizlet.com",
                            port: testmode ? 8081 : 443,
                            path: `/${path.join("/")}/`,
                            headers: headersFromBrowser
                        }, res => {
                            let outputData = "";
                            
                            res.on('data', (d) => {
                                outputData+=d.toString();
                            });
                            
                            res.on('end', () => {
                                try {
                                    const quizletStateKey = outputData.match(/"dehydratedReduxStateKey":".+?(?<!\\)"/);
                                    const quizletDataContainer = JSON.parse("{"+quizletStateKey+"}")
                                    const quizletData = JSON.parse(quizletDataContainer.dehydratedReduxStateKey);
                                    const formatted = {
                                        title: quizletData.setPage.set.title+" (imported from Quizlet)",
                                        terms: quizletData.studyModesCommon.studiableData.studiableItems.map(card => {
                                            function getSideText(side) {
                                                let plainTextMedias = side.media.filter(media => typeof media.plainText == "string" && media.plainText.length > 0);
                                                let plainTextMedia = plainTextMedias[0];
                                                if(!plainTextMedia) return "";
                                                
                                                return plainTextMedia.plainText;
                                            }
                                            
                                            return {
                                                hint: getSideText(card.cardSides[0]),
                                                definition: getSideText(card.cardSides[1])
                                            };
                                        })
                                    };
                                    respond(success({formatted}));
                                } catch(err) {
                                    console.log(err);
                                    respond(error("Quizlet didn't like that. Contact me, and I'll get this fixed ASAP."))
                                }
                            })
                        });
                        
                        req.on("error", () => respond(error("We had trouble connecting to Quizlet. Please try again. (2)")))
                        
                        req.end();
                    } catch(err) {
                        respond(error("We had trouble connecting to Quizlet. Please try again."));
                    }
                });
            }
        }
    }
});
