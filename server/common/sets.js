
const database = require("../common/database.js");
const { error, success } = require("../common/states.js");

async function getSet(body) {
    const db = await database;
    
    let set = await db.get(`
        SELECT id, userid, title, creation, modification
        FROM sets
        WHERE id = ?`, body.id);
    
    if(!set) return error("Set does not exist.");
    
    const terms = await db.all(`
        SELECT hint, definition
        FROM terms
        WHERE setid = ?`, set.id);
    
    const creator = await db.get(`
        SELECT id, username
        FROM users
        WHERE id = ?`, set.userid);
    
    return success({
        set,
        terms,
        creator
    });
}

module.exports = {
    getSet
};