
const database = require("./database.js");

async function getSessionByToken(token) {
    const db = await database;
    const session = await db.get("SELECT userid FROM tokens WHERE token = ?", token);
    
    if(!session)
        return null;
    
    const user = await db.get("SELECT id, username, theme, creation FROM users WHERE id = ?", session.userid);
    
    if(!user)
        return null;
    
    return {
        user: {
            id: user.id,
            username: user.username,
            theme: user.theme,
        }
    };
}

async function getSessionByRequest(request) {
    const token = request.cookies.token;
    if(!token)
        return null;

    return await getSessionByToken(token);
}

module.exports = {getSessionByRequest, getSessionByToken};

