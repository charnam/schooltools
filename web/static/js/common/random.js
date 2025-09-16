function randArr(array) {
    return array[Math.floor(Math.random()*array.length)];
}
function randInt(low, high) {
    if(high == undefined) {
        high = low;
        low = 0;
    }
    return Math.floor(Math.random() * (high - low)) + low;
}

export {randArr, randInt};