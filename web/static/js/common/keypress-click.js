
function mapKey(key) {
    
    if(key == "space" || key == "Space")
        return " ";

    return key;
}

class KeypressClick {

    static async keyPress(key = null) {
        key = mapKey(key);
        
        return new Promise(res => {
            const listener = event => {
                if(event.repeat) return;
                
                if(event.key == key || key == null) {
                    window.removeEventListener("keydown", listener);
                    res(key);
                }
            }
            window.addEventListener("keydown", listener);
        });
    }
    static async keyRelease(key = null) {
        key = mapKey(key);
        
        return new Promise(res => {
            const listener = event => {
                if(event.repeat) return;
                
                if(event.key == key || key == null) {
                    window.removeEventListener("keyup", listener);
                    res(key);
                }
            }
            window.addEventListener("keyup", listener);
        });
    }
    
};

window.addEventListener("keypress", async event => {
    
    if(event.repeat) return;
    
    let clickedElements =
        [...doc.els("[keypress-click]")]
            .filter(element => mapKey(element.attr("keypress-click")) == event.key);
    
    for(let element of clickedElements) {
        element.addc("keypress-clicked");
        await KeypressClick.keyRelease(event.key);
        element.remc("keypress-clicked");
        element.click();
    }
    
})

export default KeypressClick;