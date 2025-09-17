
const cookieParser = require("cookie-parser");
const express = require("express");

const app = express();
const PORT = 8091;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. (http://localhost:${PORT}/)`);
});

app.use(express.static("web"));
app.use("/static/imports/videojs/", express.static("node_modules/video.js/dist"));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.sendFile("./web/index.html");
});


module.exports = app;