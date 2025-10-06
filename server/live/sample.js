
const register = require("./register-live.js");

register({
    "sample": {
        require_session: true,
        handler: (socket, session, requestDetails) => {
            console.log("Connection received");
        }
    }
})
