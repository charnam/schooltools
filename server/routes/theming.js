
const path = require("path");

const app = require("../app.js");
const { THEMES } = require("../common/themes.js");
const database = require("../common/database.js");
const register = require("./register-routes.js");
const { getSessionByRequest } = require("../common/getsession.js");
const { error, success } = require("../common/states.js");


const cwd = process.cwd();

for(let theme of THEMES) {
    
    app.get("/api/themes/preview/"+theme.id, (req, res) => {
        res.sendFile(path.join(cwd, "./site-themes/"+theme.id+"/preview.png"));
    })
    
}

app.get("/api/themes/current_theme.css", async (req,res) => {
    const db = await database;
    const session = await getSessionByRequest(req);
    
    res.header("Content-Type", "text/css");
    
    if(!session || !session.user) {
        res.send("/* No theme applied. (You are not logged in.) */");
        res.end();
        return;
    } else {
        let user = await db.get("SELECT theme FROM users WHERE id = ?", session.user.id);
        if(!user || !user.theme) {
            res.send("/* No theme applied. (Internal error) */");
            res.end();
            return;
        }
        res.sendFile(path.join(cwd, "./site-themes/"+user.theme+"/theme.css"));
        return;
    }
});

register({
    "themes": {
        "list": {
            requirements: {},
            require_session: true,
            func: async (_body, session) => {
                return success({themes: THEMES});
            }
        },
        "set": {
            requirements: {
                theme: name => {
                    if(typeof name !== "string")
                        return error("Theme name is not a string value.");
                    
                    if(!/^[a-zA-Z0-9]+$/.test(name))
                        return error("Theme name includes invalid characters.");
                    
                    return success();
                }
            },
            require_session: true,
            func: async (body, session) => {
                if(!THEMES.some(theme => theme.id == body.theme))
                    return error("Theme name is invalid.");
                
                const db = await database;
                
                await db.run("UPDATE users SET theme = ? WHERE id = ?", body.theme, session.user.id);
                
                return success();
            }
        }
    }
})