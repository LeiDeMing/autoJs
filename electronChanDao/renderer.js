// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const Store = require('electron-store');
const { ipcRenderer } = require('electron')
const schedule = require('node-schedule');
const XLSX = require('xlsx');
require('events').EventEmitter.defaultMaxListeners = 100
const { setSchedule } = require('./utils')
const { ChanDaoUrl: urlName, chanDaoName, chanDaoPass, gitlabAccessToken, gitlabUrl } = require('./config')

const schema = {
    chandao: {
        type: 'number'
    }
}
const store = new Store({ schema });

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'

async function createPage(url) {
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: chromePath
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1366, height: 625 })
    return { page, browser }

}

async function login(page, callback) {
    await page.type('#account', chanDaoName);
    await page.type('input[type=password]', chanDaoPass);
    await page.click('button[type=submit]');
    await page.waitForNavigation()
    console.log('login')

    callback && await callback(page)
}

async function setPupper(url = '') {
    let imgName = `chandao${new Date().getTime()}`
    const { page } = await createPage(url)
    const navigationPromise = page.waitForNavigation()
    //登陆
    await login(page)

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
const gitDataDom = document.querySelector('#gitData')
const exportExcelDom = document.querySelector('#exportExcel')
let dateObj = {
    startTime: '2020-04-17',
    endTime: '2020-04-22'
}

if (store.get('chandao-BugStatus')) {
    gitDataDom.value = JSON.stringify(store.get('chandao-BugStatus'))
}

scheduleBtn.addEventListener('click', async () => {
    let rule = new schedule.RecurrenceRule();
    let _d = new Date()
    rule.minute = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
    // rule.minute = [0, 15, 30, 45];
    scheduleBtn.setAttribute('disabled', 'true')
    setSchedule(rule, async () => {
        console.log('定时任务启动 --- ' + _d)
        await main()
    })
    // await main()
})

exportExcelDom.addEventListener('click', (e) => {
    console.log(store.get('chandao-BugStatus'))
    let _d = store.get('chandao-BugStatus')
    let data = []
    if (!_d || !_d.length) return
    let head = Object.keys(_d[0])
    data.push(head)
    _d.forEach(item => {
        let arr = []
        head.forEach(col => {
            arr.push(item[col])
        })
        data.push(arr)
    })
    console.log(data)
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const new_workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(new_workbook, worksheet, "SheetJS");
    XLSX.writeFile(new_workbook, `D:\\chrome download\\json_to_excel-${(new Date()).toLocaleDateString('ko-KR')}.xlsx`);
})

dateStartInput.addEventListener('change', (event) => {
    dateObj.startTime = event.target.value
})

dateEndInput.addEventListener('change', (event) => {
    dateObj.endTime = event.target.value
})

gitBranchBtn.addEventListener('change', (event) => {
    let gitBranchValue = event.target.value || 'develop'
    let _urlFun = (ref_name) => `${gitlabUrl}/api/v4/projects/23/repository/commits?ref_name=${ref_name}&page=1&per_page=999`
    let _url = _urlFun(gitBranchValue)
    let _urlMaster = _urlFun('master')
    const httpConfig = {
        headers: {
            'PRIVATE-TOKEN': gitlabAccessToken
        }
    }
    if (dateObj.startTime) {
        _url += `&since=${dateObj.startTime}`
        _urlMaster += `&since=${dateObj.startTime}`
    } if (dateObj.endTime) {
        _url += `&until=${dateObj.endTime}`
        _urlMaster += `&until=${'2020-04-23'}`
    }
    fetch(_url, httpConfig).then(response => {
        return response.json()
    }).then(async data => {
        console.log(data)
        let typeId = new Set()
        let typeObj = {}
        let master_data = []
        await fetch(_urlMaster, httpConfig).then(res => {
            return res.json()
        }).then(master => {
            master_data = master
        })
        data.forEach(d => {
            master_data.forEach(m => {
                if (d.message === m.message) {
                    d.develop2Master = true
                }
            })
        })
        data.forEach(item => {
            if (item.message.indexOf('Merge branch') > -1) {
                item.type = 'Merge branch'
                item.typeId = 'Merge branch'
                return
            }
            let commitMsgF = item.message.split('&')
            let commitMsgE
            if (commitMsgF[1]) {
                commitMsgE = commitMsgF[0].split('@')
                item.type = commitMsgE[1]
                item.typeId = parseInt(commitMsgF[1])
                if (item.typeId) {
                    typeId.add(item.typeId/* +'--'+item.committer_name */)
                }
            }
        })
        console.log(typeId)
        // await login(page, async (page) => {
        //     await page.goto(`${urlName}/bug-view-2395.html`)
        //     await page.waitFor(1000)
        //     await page.screenshot({ path: `./utils/img/1.png` });
        // })
        let typeIdArr = Array.from(typeId)
        Promise.all(typeIdArr.map(async (item, index) => {
            if (index % 4 === 0) {
                await new Promise((resolve) => {
                    process.nextTick(() => {
                        resolve()
                    })
                })
                console.log('nexttick')
            }
            try {
                const { page, browser } = await createPage(`${urlName}/user-login.html`)
                await login(page, async (page) => {
                    await page.goto(`${urlName}/bug-view-${item}.html`)
                    await page.waitFor(2000)
                    await page.waitForSelector('.status-bug')
                    let content = await page.$eval('.status-bug', el => el.innerText);
                    // await page.screenshot({ path: `./utils/img/${item}.png` });
                    typeObj[item] = {
                        content,
                        status: '成功'
                    }
                })
                await page.close()
                await browser.close();
            } catch (e) {
                console.log(e)
                typeObj[item] = {
                    content: e.toString(),
                    status: '失败'
                }
            }
            console.log(typeIdArr.length, Object.keys(typeObj).length)
            if (typeIdArr.length === Object.keys(typeObj).length) {
                data.forEach(item => {
                    if (typeObj[item.typeId]) {
                        item.content = typeObj[item.typeId]['content']
                        item.status = typeObj[item.typeId]['status']
                    }
                })
                store.set('chandao-BugStatus', data)
                gitDataDom.value = JSON.stringify(data)

                console.log(data, typeObj)
            }
        }))
    })
})

async function test1() {
    console.log('1111111111')
}

module.exports = { main, test1 }