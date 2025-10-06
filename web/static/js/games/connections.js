import "/socket.io/socket.io.min.js";

function connect(namespace, query) {
    return io(namespace, {query});
}

export {connect};