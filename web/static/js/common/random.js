function randArr(array) {
    return array[randInt(0, array.length-1)];
}
function randInt(low, high) {
    if(high == undefined) {
        high = low;
        low = 0;
    }
    return Math.floor(Math.random() * (high - low + 1)) + low;
}
function randFloat(low, high) {
    return Math.floor(Math.random() * (high - low)) + low;
}

export {randArr, randInt};