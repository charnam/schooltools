
const ready = new Promise(res => {
    window.addEventListener("load", res);
});

export default ready;
