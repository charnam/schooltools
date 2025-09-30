
const fs = require("fs");
const path = require("path");

// Create config if none already exists
if(!fs.existsSync("config")) {
	fs.mkdirSync("config");
}

if(!fs.existsSync("config/quizlet-headers.txt")) {
	fs.writeFileSync("config/quizlet-headers.txt", "");
}

require("./server/main.js")
