
function accountSettings(container, user) {
    container
        .crel("p")
            .txt("You are logged in as ")
            .crel("a").attr("href", "/user/?id="+user.id)
                .txt(user.username)
            .prnt()
            .txt(".")
        .prnt()
        .crel("ul")
            .crel("li").crel("a").attr("href", "/account/profile/").txt("Edit Profile").prnt().prnt()
            .crel("li").crel("a").attr("href", "/account/themes/").txt("Change site theme").prnt().prnt()
            .crel("li").crel("a").attr("href", "/account/logout/").txt("Log out").prnt().prnt()
        .prnt()
}

export default accountSettings;
