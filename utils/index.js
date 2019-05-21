const fs = require('fs');

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


function deleteImg(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteall(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
module.exports={
    getObjLen,
    buble,
    deleteImg
}