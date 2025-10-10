
class DefaultViews {
    
    static counting_down() {
        doc.el("#view-wrapper")
            .el("#counting_down")
                .crel("div").attr("id", "countdown-digit");
    }
    
    static server_error() {
        doc.el("#view-wrapper")
            .el("#server_error")
                .crel("div").attr("id", "error-message");
    }
    
}

export default DefaultViews;
