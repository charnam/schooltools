
import "/static/js/solar.js";

import api from "./api.js";
import ready from "./common/ready.js";
import refill from "./common/fill.js";

window.api = api;

if(doc.el("header"))
    doc.el("header").attr("fill", "header");
if(doc.el("footer"))
    doc.el("footer").attr("fill", "footer");
refill();

ready.then(() => {
    
});
