const { Server } = require("socket.io");
const httpServer = require("./httpServer.js");

const io = new Server(httpServer);

module.exports = io;
