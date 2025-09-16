import api from "/static/js/api.js";

function openVocabPage(page) {
    
    window.location.href = "/vocabsets/"+page+"/"+window.location.search;
    
}
async function getSetNonBlocking() {
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    const response = await api("sets/get", {id});
    
    if(!id) {
        return {type: "error", message: "Invalid request. (no vocabulary set id provided)"};
    }
    
    return response;
}

async function getSet() {
    
    const response = await getSetNonBlocking();
    
    if(response.type == "error") {
        throw doc.el("main").html("")
            .crel("p")
                .txt("Error fetching vocabulary set details: ")
                .txt(response.message);
    }
    
    return response;
}


export {openVocabPage, getSet, getSetNonBlocking};