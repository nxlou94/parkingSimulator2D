function normal(array2D){
    return [array2D[1], - array2D[0]];
}

function magnitude(array){
    var square = 0;
    array.forEach(element => {
        square += element ** 2;
    });
    return Math.sqrt(square);
}

function normalize(array){
    const m = magnitude(array);
    var a1 = []
    for(let i = 0; i < array.length; i++){
        a1.push(array[i] / m);
    }
    return a1;
}

function dot(array1, array2){
    var result = 0;
    const l = array1.length;
    if(l != array2.length){
        return NaN;
    }else{
        for(let i = 0; i < l; i++) {
            result += array1[i] * array2[i];
        }
        return result;
    }
}