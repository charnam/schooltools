
const cookieParser = require("cookie-parser");
const express = require("express");

const app = express();

app.use(express.static("web"));
app.use("/static/imports/videojs/", express.static("node_modules/video.js/dist"));
app.use("/static/imports/glslCanvas/", express.static("node_modules/glslCanvas/dist"));
app.use('/static/imports/bootstrap-icons/', express.static('node_modules/bootstrap-icons/icons'));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.sendFile("./web/index.html");
});


module.exports = app;