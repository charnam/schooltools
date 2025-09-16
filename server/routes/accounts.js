

const register = require("./register-routes.js");
const database = require("../common/database.js");
const { error, success } = require("../common/states.js");

const mkid = require("uuid").v4;

const bcrypt = require("bcrypt");

async function login(userid, response) {
    const db = await database;
    
    const token = mkid();
    await db.run(`
        INSERT INTO tokens
        (token, userid)
        VALUES
        (?, ?)
    `, [token, userid]);
    
    response.cookie("token", token, { maxAge: 12*31*24*60*60*1000, httpOnly: true });
    return token;
}

register({
    "accounts": {
        "session": {
            requirements: {},
            func: async (_body, session) => {
                if(!session) return error("Not logged in.");
                
                return success({
                    session
                })
            }
        },
        "login": {
            requirements: {
                username: "string",
                password: "string"
            },
            func: async (body, _session, _req, res) => {
                const db = await database;
                
                const user = await db.get(`
                    SELECT id, password FROM users WHERE username = ?
                `, body.username);
                
                if(!user)
                    return error("Invalid username");
                
                if(!await bcrypt.compare(body.password, user.password))
                    return error("Incorrect password");
                
                const token = await login(user.id, res);
                
                return success({token});
            }
        },
        "register": {
            requirements: {
                username: "string",
                password: "string"
            },
            func: async (body, session, _req, res) => {
                const db = await database;
                
                if(body.username.length < 3)
                    return error("Username is too short. Make sure it is three characters or longer");
                if(body.username.length > 24)
                    return error("Username is too long. Make sure it is 24 characters or shorter");
                
                if(await db.get("SELECT id FROM users WHERE username = ?", body.username) != null)
                    return error("This username is already in use. Please choose a different name.");
                
                if(body.password.length < 8)
                    return error("Password should be at least 8 characters long");
                
                const hashedPassword = await bcrypt.hash(body.password, 12);
                
                if(session && session.user.isGuest) {
                    await db.run(`
                        UPDATE users
                        SET
                            username = ?,
                            password = ?,
                            creation = ?,
                            guestname = ''
                        WHERE
                            userid = ?
                    `, [body.username, body.password, Date.now(), session.userid]);
                    
                    return success({
                        message: "Account transformed."
                    });
                } else {
                    const userid = await mkid();
                    
                    await db.run(`
                        INSERT INTO users
                        (id, username, password, creation)
                        VALUES
                        (?, ?, ?, ?)
                    `, [userid, body.username, hashedPassword, Date.now()]);
                    
                    const token = await login(userid, res);
                    
                    return success({
                        token
                    });
                }
            }
        },
        "logout": {
            requirements: {},
            require_session: true,
            func: async (_body, _session, _req, res) => {
                res.cookie("token", "", { maxAge: 1, httpOnly: true });
                return success();
            }
        }
    }
});
