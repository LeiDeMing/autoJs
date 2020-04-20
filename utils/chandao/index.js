const puppeteer = require('puppeteer');
const fs = require('fs');
const Store = require('electron-store');
// const schema = {
//     chandao: {
//         type: 'number'
//     }
// }
// const store = new Store({ schema });
const config = require('../../config');
const { deleteImg } = require('../index');

async function setPupper(url) {
    let imgName = `chandao${new Date().getTime()}`
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation()
    await page.goto(url);
    await page.setViewport({ width: 1366, height: 625 })
    //删除img目录下所有图片

    //登陆
    await page.type('#account', 'lingming');
    await page.type('input[type=password]', 'Ziaixuan1314');
    await page.click('button[type=submit]');
    await navigationPromise
    console.log('login')

    //测试
    await page.waitForSelector('.container > #navbar > .nav > li:nth-child(3) > a')
    await page.click('.container > #navbar > .nav > li:nth-child(3) > a')
    await navigationPromise
    console.log('1')

    //选择项目
    await page.waitForSelector('.container > #pageNav #currentItem')
    await page.click('.container > #pageNav #currentItem')
    await page.waitFor(500)
    console.log('2')

    //选择项目
    await page.waitForSelector('.list-group > .table-row > .table-col > .list-group > a:nth-child(2)')
    await page.click('.list-group > .table-row > .table-col > .list-group > a:nth-child(2)')
    await navigationPromise
    console.log('3')

    //点击搜索
    await page.waitForSelector('#main #bysearchTab')
    await page.click('#main #bysearchTab')
    await page.waitFor(500)
    console.log('4')

    await page.waitForSelector('tbody > #searchbox1 > .fieldWidth > #field1_chosen > .chosen-single')
    await page.click('tbody > #searchbox1 > .fieldWidth > #field1_chosen > .chosen-single')
    await page.waitFor(500)
    console.log('5')

    //选择 指派给
    await page.waitForSelector('#field1')
    await page.select('#field1', 'assignedTo')
    await page.waitFor(500)
    console.log('6')

    await page.waitForSelector('#value1')
    await page.select('#value1', 'lingming')
    await page.waitFor(500)
    console.log('7')

    await page.waitForSelector('#bug-search #submit')
    await page.click('#bug-search #submit')
    await navigationPromise
    await page.waitFor(500)
    console.log('8')

    await page.waitForSelector('tbody > #searchbox1 > .fieldWidth > #field1_chosen > .chosen-single')
    await page.click('tbody > #searchbox1 > .fieldWidth > #field1_chosen > .chosen-single')
    await page.waitFor(500)
    console.log('9')

    await page.waitForSelector('#field4')
    await page.select('#field4', 'pri')
    await page.waitFor(500)
    console.log('10')

    await page.waitForSelector('#operator4')
    await page.select('#operator4', '<=')
    await page.waitFor(500)
    console.log('11')

    await page.waitForSelector('#value4')
    await page.select('#value4', '2')
    await page.waitFor(500)
    console.log('12')

    await page.waitForSelector('#bug-search #submit')
    await page.click('#bug-search #submit')
    await navigationPromise
    await page.waitFor(2000) //正式使用去掉
    console.log('13')

    await page.waitForSelector('#bugList > tbody > tr')
    const bugDom = await page.$$('#bugList > tbody > tr')

    let addBugNum = 0
    // document.querySelector('#preBugNum').innerHTML = storeChanDao
    // if (storeChanDao >= 0) {
    //     // if (bugDom.length > storeChanDao) {
    //     addBugNum = bugDom.length - storeChanDao
    //     document.querySelector('#lastAddBugNum').innerHTML = addBugNum
    //     // if (addBugNum >= 1) {
    //     notifier.notify({
    //         title: `禅道新增数量 -- ${new Date()}`,
    //         message: addBugNum
    //     })
    //     // }
    //     // }
    // }
    // store.set('chandao', bugDom.length)
    // document.querySelector('#lastBugNum').innerHTML = bugDom.length
}

async function main() {
    await setPupper('http://10.49.32.118:8086/zentao/user-login.html')
}

module.exports = main