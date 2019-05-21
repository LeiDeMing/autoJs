const puppeteer = require('puppeteer');
const config = require('../config/index');
const fs = require('fs');
const open = require('open');
const {deleteImg}=require('./index');

async function setPupper(url) {
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    let newPage = await browser.newPage();
    let imgName=`translation${new Date().getTime()}`
    await newPage.goto(url);
    deleteImg('./utils/img')
    fs.mkdirSync('./utils/img', (err) => {
        if (err) throw err;
    })
    await newPage.screenshot({ path: `./utils/img/${imgName}.png` })
    // await open(`./utils/img/${imgName}.png`, {wait: true});

    // await newPage.type('#userName','wangzhengyang',{
    //     delay:100
    // });
    // await newPage.type('#password','123456',{
    //     delay:100
    // });
    await newPage.close();
}

async function main() {
    await setPupper(config.frontUrl)
}


module.exports = main