// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const Store = require('electron-store');
const { ipcRenderer } = require('electron')
const WindowsToaster = require('node-notifier').WindowsToaster;
const schedule = require('node-schedule');
const { setSchedule } = require('./utils')
const { ChanDaoUrl: urlName, chanDaoName, chanDaoPass, gitlabAccessToken, gitlabUrl } = require('./config')

var Notifier = new WindowsToaster({
    withFallback: false, // Fallback to Growl or Balloons?
    customPath: undefined // Relative/Absolute path if you want to use your fork of SnoreToast.exe
});
const schema = {
    chandao: {
        type: 'number'
    }
}
const store = new Store({ schema });

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'

async function setPupper(url = '') {
    let imgName = `chandao${new Date().getTime()}`
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: chromePath
    });
    const page = await browser.newPage();

    const navigationPromise = page.waitForNavigation()
    await page.goto(url);
    await page.setViewport({ width: 1366, height: 625 })

    //登陆
    await page.type('#account', chanDaoName);
    await page.type('input[type=password]', chanDaoPass);
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
    // await page.waitForResponse(`${urlName}/product-ajaxGetDropMenu-85-qa-index-.html`)
    await page.waitFor(400)
    console.log('2')

    //选择项目
    await page.waitForSelector('.list-group > .table-row > .table-col > .list-group > a:nth-child(2)')
    await page.click('.list-group > .table-row > .table-col > .list-group > a:nth-child(2)')
    await navigationPromise
    // await page.waitFor(500)
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
    // await page.waitFor(2000) //正式使用去掉
    console.log('13')

    await page.waitForResponse(`${urlName}/search-buildForm-bug.html`)

    await page.waitForSelector('#bugList > tbody > tr')
    const bugDom = await page.$$('#bugList > tbody > tr')

    const storeChanDao = store.get('chandao')
    let addBugNum = 0
    const lastDom = document.querySelector('#lastAddBugNum')
    document.querySelector('#preBugNum').innerHTML = storeChanDao
    if (storeChanDao >= 0) {
        lastDom.innerHTML = 0
        if (bugDom.length > storeChanDao) {
            addBugNum = bugDom.length - storeChanDao
            lastDom.innerHTML = addBugNum
            // if (addBugNum >= 1) {
            // Notifier.notify({
            //     appName: "com.myapp.id",
            //     title: '禅道新增数量 -- ' + new Date(),
            //     message: addBugNum + '',
            //     install: 'com.myapp.id'
            // })
            let _d = new Date()
            await ipcRenderer.send('open-chandao-dialog', {
                title: '禅道新增数量 -- ' + _d.toLocaleDateString('ko-KR'),
                message: '新增数量：' + addBugNum + ''
            })
            // }
        }
    }
    store.set('chandao', bugDom.length)
    document.querySelector('#lastBugNum').innerHTML = bugDom.length

    // await page.close()
}

async function main() {
    await setPupper(`${urlName}/user-login.html`)
}

const scheduleBtn = document.querySelector('#getBug')
const gitBranchBtn = document.querySelector('#gitBranch')
const dateStartInput = document.querySelector('#dateStart')
const dateEndInput = document.querySelector('#dateEnd')
let dateObj = {

}
scheduleBtn.addEventListener('click', async () => {
    let rule = new schedule.RecurrenceRule();
    let _d = new Date()
    // rule.minute = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
    rule.minute = [0, 15, 30, 45];
    scheduleBtn.setAttribute('disabled', 'true')
    setSchedule(rule, async () => {
        console.log('定时任务启动 --- ' + _d)
        await main()
    })
    // await main()
})

dateStartInput.addEventListener('change', (event) => {
    dateObj.startTime = event.target.value
})

dateEndInput.addEventListener('change', (event) => {
    dateObj.endTime = event.target.value
})

gitBranchBtn.addEventListener('change', (event) => {
    let gitBranchValue = event.target.value || 'develop'
    let _url = `${gitlabUrl}/api/v4/projects/23/repository/commits?ref_name=${gitBranchValue}&page=1&per_page=999`
    if (dateObj.startTime) {
        _url += `&since=${dateObj.startTime}`
    } if (dateObj.endTime) {
        _url += `&until=${dateObj.endTime}`
    }
    fetch(_url, {
        headers: {
            'PRIVATE-TOKEN': gitlabAccessToken
        }
    }).then(response => {
        return response.json()
    }).then(data => {
        console.log(data)
    })
})



module.exports = main