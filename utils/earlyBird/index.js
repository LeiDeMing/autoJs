const puppeteer = require('puppeteer');
const email = require('../email');
const config = require('../../config');

async function getEarlyBirdNums() {
    let browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 625 })
    await page.goto('https://earlybirdcamp.sorrycc.com/'/* , { waitUntil: 'domcontentloaded' } */);
    await page.waitFor(4000)
    console.log('登陆')

    await page.waitForSelector('.text-orange-700')
    const num = await page.$eval('.text-orange-700', el => el.innerHTML)

    await page.waitForSelector('.text-gray-700')
    const content = await page.$eval('.text-gray-700', el => el.innerText)

    await page.waitForSelector('.btn-orange')
    await page.click('.btn-orange')
    await page.waitFor(4000)

    await page.type('#login_field', config.githubName)
    await page.type('#password', config.githubPass)
    // await page.click('input[type=submit]')
    // await page.waitForNavigation({ waitUntil: 'networkidle0' })

    // await page.waitForSelector('.btn-orange')
    // await page.click('.btn-orange')
    // await page.waitForResponse('https://earlybirdcamp.sorrycc.com/api/github/memberStatus')
    // await page.waitFor(2000)

    // await page.waitForSelector('.py-8')
    // const status = await page.$eval('.py-8', el => el.innerText)
    // let statusColor = 'red'
    // if(status.indexOf('失败') === -1) statusColor = 'skyblue'
    // // await page.screenshot({ path: `./utils/img/${'earlybirdcamp'}.png`, fullPage: true });
    // const _html = `<div>
    //     <h2>当前参与总人数：<strong style="color:red;">${num}</strong></h2>
    //     <p>抓取内容：</p>
    //     <p>${content}</p>
    //     <h3>加入状态：<strong style="color:${statusColor}">${status}</strong></h3>
    // </div>`
    // email.setEmail({
    //     from: '2623024110@qq.com',
    //     to: '136371773@qq.com',
    //     subject: 'EarlyBirdCamp（早鸟营）人数变更',
    //     html: _html
    // })
}

module.exports = {
    getEarlyBirdNums
}