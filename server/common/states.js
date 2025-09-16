class States {
    static error(message) {
        return {type: "error", message}
    }
    static success(data = {}) {
        return {type: "success", ...data}
    }
    static session_required() {
        return States.error("You need to be logged in. Open the home page in a new tab, and try logging in again.");
    }
};

module.exports = States;