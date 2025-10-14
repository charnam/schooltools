
const path = require("path");
const io = require("../io.js");
const cookie = require("cookie");
const { getSessionByToken } = require("./getsession.js");

function register_route(route, details) {
    const namespace = io.of(route);

    namespace.on("connection", async socket => {
        try {
            let session = null;
            if(socket.request.headers.cookie) {
                const cookies = cookie.parse(socket.request.headers.cookie);
                if(cookies.token)
                    session = await getSessionByToken(cookies.token);
            }
            
            if(details.require_session && !session) {
                socket.emit("server-disconnect", "Please log in to access this page.");
                socket.disconnect();
                return;
            }

            // TODO: enforce requirements on query

            let result = await details.handler(socket, session, socket.handshake.query);
            if(result && result.type == "error") {
                socket.emit("server-disconnect", result.message);
                socket.disconnect();
            }
        } catch(err) {
            console.error(err);
            socket.emit("server-disconnect", "It seems something has gone horribly wrong. If this doesn't work after trying a second time, send an email to charnam@lunarsphere.net");
            socket.disconnect();
            return;
        }
    })
}

function register_routes(routes, origin = "/") {
    const entries = Object.entries(routes);
    for(let [route, details] of entries) {
        const fullpath = path.join(origin, route);

        if(typeof details.handler === "function") {
            register_route(fullpath, details);
        } else {
            register_routes(fullpath, details);
        }
    }
}

module.exports = register_routes;
