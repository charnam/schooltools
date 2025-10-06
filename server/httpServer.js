
const { createServer } = require("http");
const app = require("./app.js");

const server = createServer(app);

server.listen(8091);
console.log("Listening on port 8091")

module.exports = server;
