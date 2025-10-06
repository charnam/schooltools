
// GlslCanvas is bugged, requires importing weirdly
import "/static/js/games/wallpaper-shim/GlslCanvas-preimport.js";
import "/static/imports/glslCanvas/GlslCanvas.js"
const GlslCanvas = window.module.exports;
delete window.exports;
delete window.module;

async function setWallpaper(file) {
    const canvas = doc.el("body")
        .crel("div").attr("id", "wallpaper")
            .crel("canvas"); 
    
    const sandbox = new GlslCanvas(canvas);
    window._debug__sandbox = sandbox;
    
    const frag = await fetch("/static/gl/"+file)
                    .then(res => res.text());
    
    sandbox.load(frag);
    
    // Force canvas resize (without this, it stays at
    // a lower resultion until the window changes size)
    sandbox.width = 0;
}

export default setWallpaper;