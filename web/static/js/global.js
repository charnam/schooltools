import api from "./api.js";
import ready from "./common/ready.js";
import refill from "./common/fill.js";

window.api = api;

{
    let s = document.createElement("script");
    s.src = "https://lunarsphere.net/solar.js";
    s.onload = () => {
        doc.el("header").attr("fill", "header");
        doc.el("footer").attr("fill", "footer");
        refill();
    }
    document.head.appendChild(s);
}

ready.then(() => {
    
});
