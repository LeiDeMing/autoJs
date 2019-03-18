function getObjLen(obj){
    if(Object.prototype.toString.call(obj)!=="[object Object]"){
        return 0
    }else{
        return Object.keys(obj).length
    }
}

module.exports={
    getObjLen
}