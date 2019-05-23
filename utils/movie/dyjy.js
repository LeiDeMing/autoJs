const puppeteer = require('puppeteer'),
    fs = require('fs');
const config = require('../../config/index'),
    { deleteImg } = require('../index');


async function getMovieFromDyjy(){
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page=await browser.newPage();
    let pageSize=1;
    let year=2019;
    let pageAll=1
    let dyjyUrl=`http://www.idyjy.com/w.asp?p=${pageSize}&f=3&n=${year}&l=s`;
    await page.goto(dyjyUrl);
    const pageNav=await page.$eval('#pages', el =>  el.innerText);
    pageAll=pageNav.split(':')[1].split('页首页')[0].split('/')[1];
    
    let oLi=await page.$$('.img-list li');
    for(let x=0;x<oLi.length;x++){
        oLi[x]
    }
}

async function main(){
    await getMovieFromDyjy();
}

module.exports=main