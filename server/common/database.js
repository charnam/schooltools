
const fs = require("fs");

const sqlite3 = require("sqlite3")
const sqlite = require("sqlite")


const dbPromise = sqlite.open({
    filename: "./config/database.db",
    driver: sqlite3.Database
});

(async function() {
	const db = await dbPromise;

	const query = fs.readFileSync("./server/database_schema.sql").toString();

	await db.exec(query);
})();

// This wrapper is here to make it easier to
// swap out the backend database later.
// (e.g postgres? mysql?)
module.exports = dbPromise.then(db => ({
    async run(...args) {
        return await db.run(...args);
    },
    async exec(...args) {
        return await db.exec(...args);
    },
    async get(...args) {
        return await db.get(...args);
    },
    async all(...args) {
        return await db.all(...args);
    }
}))

