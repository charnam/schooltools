
const register = require("./register-routes.js");
const database = require("../common/database.js");
const { error, success } = require("../common/states.js");
const { getSet } = require("../common/sets.js");

const mkid = require("crypto").randomUUID;

function check_title(title) {
    
    if(typeof title !== "string")
        return error("title is not a string");
    
    if(title.length == 0)
        return error("Title is empty.");
    if(title.length > 64)
        return error("Title is longer than 64 characters.");
    
    return success();
}
function check_terms(array) {
    if(!Array.isArray(array))
        return error("terms is not an array");
    for(let entry of array) {
        if(
            typeof entry !== "object" ||
            typeof entry.hint !== "string" ||
            typeof entry.definition !== "string"
        )
            return error("API error: One or more terms are not defined properly.");
        
        if(entry.hint.length == 0)
            return error("One or more hints are empty.");
        if(entry.hint.length > 2048)
            return error("One or more hints are longer than 2,048 characters.");
        if(entry.definition.length == 0)
            return error("One or more definitions are empty.");
        if(entry.definition.length > 2048)
            return error("One or more definitions are longer than 2,048 characters.");
    }
    return success();
}

register({
    "sets": {
        "create": {
            require_session: true,
            requirements: {
                title: check_title,
                terms: check_terms
            },
            func: async (body, session) => {
                const db = await database;
                const setid = mkid();
                
                await db.run(`
                    INSERT INTO sets
                    (id, userid, title, creation, modification)
                    VALUES
                    (?,?,?,?,?)
                `, [setid, session.user.id, body.title, Date.now(), Date.now()]);
                
                for(let position in body.terms) {
                    let {hint, definition} = body.terms[position];
                    await db.run(`
                        INSERT INTO terms
                        (id, setid, hint, definition, position, creation)
                        VALUES
                        (?, ?, ?, ?, ?, ?)`,
                        mkid(), setid, hint, definition, position, Date.now()
                    );
                }
                
                return success({setid});
            }
        },
        "update": {
            requirements: {
                set: "string",
                title: check_title,
                terms: check_terms
            },
            require_session: true,
            func: async (body, session) => {
                const db = await database;
                const set = await db.get("SELECT * FROM sets WHERE id = ?", body.set);
                
                if(session.user.id !== set.userid) {
                    return error("This set is not owned by you, so you can't edit it.");
                }
                
                await db.run("DELETE FROM terms WHERE setid = ?", set.id);
                
                await db.run("UPDATE sets SET modification = ? WHERE id = ?", Date.now(), set.id);
                
                for(let position in body.terms) {
                    let {hint, definition} = body.terms[position];
                    await db.run(`
                        INSERT INTO terms
                        (id, setid, hint, definition, position, creation)
                        VALUES
                        (?, ?, ?, ?, ?, ?)`,
                        mkid(), set.id, hint, definition, position, Date.now()
                    );
                }
                
                return success();
            }
        },
        "my-sets": {
            requirements: {},
            require_session: true,
            func: async (_body, session) => {
                const db = await database;
                return success({
                    sets:
                        await db.all(`
                            SELECT * FROM sets
                            WHERE userid = ?
                            ORDER BY creation DESC
                            `, session.user.id)
                });
            }
        },
        "get": {
            requirements: {
                id: "string"
            },
            func: async(body) => {
                return getSet(body);
            }
        }
    }
})
