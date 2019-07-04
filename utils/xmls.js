const xlsx=require('node-xlsx');
const fs=require('fs')

const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(`./nifty/xmls/demo.xlsx`));
let header=JSON.parse(JSON.stringify(workSheetsFromBuffer[0]['data'][0]))
workSheetsFromBuffer[0]['data'].shift()
let index=[]
workSheetsFromBuffer[0]['data'].forEach(arr=>{
    if(index.indexOf(arr[29])===-1){
        index.push(arr[29])
    }
})
index.forEach(ind=>{
    let dataArr=[]
    workSheetsFromBuffer[0]['data'].forEach(item=>{
        if(ind===item[29]){
            dataArr.push(item)
        }
    })
    const data = [header, ...dataArr];
    var buffer = xlsx.build([{name: "mySheetName", data: data}]);
    fs.writeFile(`./nifty/xmls/${ind}.xlsx`,buffer,err=>{
        console.log(err)
    })
})
// const data = workSheetsFromBuffer[0]['data'];
// var buffer = xlsx.build([{name: "mySheetName", data: data}]);
// fs.writeFile('./xmls/1.xlsx',new Buffer(buffer),(err)=>{
//     console.log(err)
// })