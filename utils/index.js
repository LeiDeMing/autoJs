function getObjLen(obj){
    if(Object.prototype.toString.call(obj)!=="[object Object]"){
        return 0
    }else{
        return Object.keys(obj).length
    }
}
function buble(arra){
    var temp;
    for(var i=0;i<arra.length;i++){ //比较多少趟，从第一趟开始
        for(var j=0;j<arra.length-i-1;j++){ //每一趟比较多少次数
            if(arra[j]>arra[j+1]){
                temp=arra[j];
                arra[j]=arra[j+1];
                arra[j+1]=temp;
            }
        }
    };
    return arra;
}
module.exports={
    getObjLen,
    buble
}