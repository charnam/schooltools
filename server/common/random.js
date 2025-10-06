
function randInt(low, high) {
    if(high == undefined) {
        high = low;
        low = 0;
    }
    return Math.floor(Math.random() * (high - low + 1)) + low;
}

function randArr(array) {
    return array[randInt(0, array.length)];
}

module.exports = {randArr, randInt};