const puppeteer = require('puppeteer');
const config = require('../config/index');
const fs = require('fs');

async function setPupper(url) {
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    let newPage = await browser.newPage();
    await newPage.goto(url);
    deleteall('./utils/img')
    fs.mkdirSync('./utils/img', (err) => {
        if (err) throw err;
    })
    await newPage.screenshot({ path: `./utils/img/translation${new Date().getTime()}.png` })
    // await newPage.type('#userName','wangzhengyang',{
    //     delay:100
    // });
    // await newPage.type('#password','123456',{
    //     delay:100
    // });
    await newPage.close();
}


function deleteall(path) {
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

async function main() {
    await setPupper(config.frontUrl)
}


module.exports = main