const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('../config/index');
const {deleteImg}=require('./index');

async function setPupper(url){
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page=await browser.newPage();
    let imgName=`nifty${new Date().getTime()}`
    await page.goto(url);
    //删除img目录下所有图片
    deleteImg('./utils/img')
    fs.mkdirSync('./utils/img', (err) => {
        if (err) throw err;
    })
    //登陆
    await page.type('#sign-user-input','zhouhao');
    await page.type('#sign-pwd-input','123456');
    await page.click('button[type=submit]');
    await page.waitForNavigation()
    //样本中心-已接收
    await page.click('#sample');
    await page.goto('http://172.16.171.45:3000/#/home/PackageRecive/');
    const tabList=await page.$$('.ant-tabs-tab');
    await tabList[2].click()
    await page.waitFor(1000)
    const removeDateValue = await page.$$('.ant-calendar-picker-clear');
    for(let x=0;x<removeDateValue.length;x++){
        await removeDateValue[x].click();
    }
    const searchBtn=await page.$$('.ant-tabs-tabpane-active button');
    await searchBtn[0].click();
    const recivePackageRes=await page.waitForResponse('http://192.168.53.32:8080/presap/webintf.do?method=quer_on_the_way_package')
    const {code,data}=await recivePackageRes.json();
    let expressNumberList=[]
    if(code==='200'){
        data.forEach(item=>{
            if(item['zmenge']<=10){
                expressNumberList.push(item['expressNumber'])
            }
        })
    }

    tabList[0].click()
    await page.waitFor(1000)
    
    await page.type('input[placeholder="请扫描"]',expressNumberList[0]);
    const tab1SearchBtn=await page.$('input[placeholder="请扫描"]');
    console.log(tab1SearchBtn)

    await page.screenshot({ path: `./utils/img/${imgName}.png` });

    await page.close()
}

async function main(){
    await setPupper('http://172.16.171.45:3000/#/sign/')
}

module.exports=main