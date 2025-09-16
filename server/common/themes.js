
const fs = require("fs");
const path = require("path");

let THEMES = fs.readdirSync("./site-themes");

THEMES = THEMES.map(theme_id => {
    const theme_config_buf = fs.readFileSync(path.join("./site-themes/", theme_id, "theme.json"));
    const theme_config_json = JSON.parse(theme_config_buf.toString());
    
    return {
        ...theme_config_json,
        id: theme_id,
        image_url: "/api/themes/preview/"+theme_id
    }
});


module.exports = {
    THEMES
};
