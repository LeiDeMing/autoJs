const puppeteer = require('puppeteer');
const config = require('../config/index');


async function setPupper(url){
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page=await browser.newPage();
    await page.goto(url);
    await page.type('#sign-user-input','zhouhao',{
        delay:100
    });
    await page.type('#sign-pwd-input','123456',{
        delay:100
    });
    await page.evaluate(()=>{
        document.querySelector('.sign-loginbtn').click();
    })
    await page.screenshot({ path: `./utils/img/nifty.png` });
    // await page.click('sample')
    const tabListDom = await page.evaluate(async ()=>{
        const tabList=document.querySelectorAll('#sample_PackageRecive')
        return tabList
    })
    console.log(tabListDom)
    await page.close()
}

async function main(){
    await setPupper('http://172.16.171.45:3000/#/sign/')
}

module.exports=main