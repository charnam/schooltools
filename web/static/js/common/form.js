
import ready from "/static/js/common/ready.js";
import api from "/static/js/api.js";

function handleForm(form, func) {
    if(typeof func == "undefined") {
        func = form;
        form = document.forms[0];
    }
    if(typeof func == "string") {
        const endpoint = func;
        func = (body) => api(endpoint, body);
    }
    form.addEventListener("submit", async event => {
        event.preventDefault();
        await ready;
        let data = new FormData(form);
        
        form.attr("disabled", "true");
        const result = await func(data);
        form.removeAttribute("disabled");
        
        if(!result) return;
        
        if(result.type == "error") {
            form.attr("error", result.message);
            function removeMessage() {
                form.removeAttribute("error")
                form.removeEventListener("input", removeMessage);
            }
            form.addEventListener("input", removeMessage);
        }
    });
}

export default handleForm;
