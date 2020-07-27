// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const Store = require('electron-store');
const { ipcRenderer } = require('electron')
const schedule = require('node-schedule');
const XLSX = require('xlsx');
const moment = require('moment')
require('events').EventEmitter.defaultMaxListeners = 100
const { setSchedule, deleteImg } = require('./utils')
const { formUploader, getDataMsg, deleteData } = require('./middlewares/qiniu')
const { ChanDaoUrl: urlName, chanDaoName, chanDaoPass, gitlabAccessToken, gitlabUrl, gitLabName, gitLabPass } = require('./config')

const schema = {
    chandao: {
        type: 'number'
    }
}
const store = new Store({ schema });

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'

async function createPage(url, selfPage = true) {
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: chromePath
    })
    if (selfPage) {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.setViewport({ width: 1366, height: 625 })
        return { page, browser }
    }
    return { browser }

}

async function login(page, callback) {
    await page.type('#account', chanDaoName);
    await page.type('input[type=password]', chanDaoPass);
    await page.click('button[type=submit]');
    await page.waitForNavigation()
    console.log('login')

    callback && await callback(page)
    return page
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
const dateEndInput = document.querySelector('#dateEnd')
const exportExcelDom = document.querySelector('#exportExcel')
const btnCloseDom = document.querySelector('#btn-close')
const viewDoneBugDom = document.querySelector('#view-done-bug')
const viewCloseBugDom = document.querySelector('#view-close-bug')
const gitBranchAllDom = document.querySelector('#gitBranch-all')
const gitBranchRequestedDom = document.querySelector('#gitBranch-requested')
const removeDataDom = document.querySelector('#removeData')
let dateObj = {
    startTime: '2020-04-16',
    endTime: '2020-05-08'
}
let _urlFun = (ref_name, since) => {
    let _url = `${gitlabUrl}/api/v4/projects/23/repository/commits?ref_name=${ref_name}&page=1&per_page=100`
    if (since) _url += `&since=${since}`
    return _url
}
const httpConfig = {
    headers: {
        'PRIVATE-TOKEN': gitlabAccessToken,
        // 'X-Total': 99999,
        // 'X-Page':1,
        // 'X-Per-Page':99999
    }
}

removeDataDom.addEventListener('click', e => {
    store.set('chandao-BugStatus', null)
})

btnCloseDom.addEventListener('click', async (e) => {
    let bugObj = {}
    let yestertoday = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD") //后期改用时间库
    const bugMaster = {}
    await fetch(_urlFun('develop', yestertoday), httpConfig).then(res => {
        return res.json()
    }).then(data => {
        data.forEach(item => {
            if (item.author_email === 'xuan136371773@gmail.com') {
                let msgF = item.title.split('&')
                let msgE = msgF[0].split('@')[1]
                let n = parseInt(msgF[1])
                if (!isNaN(n))
                    bugObj[n] = {
                        bugId: n,
                        title: item.title
                    }
            }

        })
    })
    console.log(bugObj)
    Promise.all(Object.keys(bugObj).map(async (item, index) => {
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
                await page.goto(`${urlName}/bug-view-${item}.html`, { waitUntil: 'domcontentloaded' })
                await page.waitForSelector('#legendBasicInfo table>tbody>tr:nth-child(11)>td')
                await page.waitForSelector('#legendLife table>tbody>tr:nth-child(1)>td')
                let pointContent = await page.$eval('#legendBasicInfo table>tbody>tr:nth-child(11)>td', el => el.innerText);
                let createContent = await page.$eval('#legendLife table>tbody>tr:nth-child(1)>td', el => el.innerText);
                // await page.screenshot({ path: `./utils/img/${item}.png` });
                // if (pointContent.indexOf('凌明') > -1 || pointContent.indexOf('冯显帅') > -1) {
                let _u = pointContent.split(' ')[0]
                // if (!bugMaster[_u]) {
                //     bugMaster[_u] = {
                //         'bug创建者': _u,
                //         'bugId': item
                //     }
                // } else {
                //     bugMaster[_u] = {
                //         'bug创建者': _u,
                //         'bugId': `${bugMaster[_u].bugId},${item}`
                //     }
                // }
                if (!bugMaster[_u]) bugMaster[_u] = []
                bugMaster[_u].push(item)
                // }
                console.log(JSON.stringify(bugMaster))
            })
            await page.close()
            await browser.close();
        } catch (e) {
            console.log(e)

        }
    }))
})


scheduleBtn.addEventListener('click', async () => {
    let rule = new schedule.RecurrenceRule();
    let _d = new Date()
    // rule.minute = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
    // rule.minute = [0, 15, 30, 45];
    rule.minute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    scheduleBtn.setAttribute('disabled', 'true')
    try{
        console.log('定时任务启动 --- ' + _d)
        await main()
    }catch(e){
        console.log('数量为 0 ！！！！！！！')
    }
    setSchedule(rule, async () => {
        console.log('定时任务启动 --- ' + _d)
        try {
            await main()
        } catch (e) {
            console.log('数量为 0 ！！！！！！！')
        }
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
    if (!_d) {
        window.alert('缓存数据为NULL')
        return
    }
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

viewDoneBugDom.addEventListener('click', (e) => {
    console.log(store.get('chandao-BugStatus'))
    let _d = store.get('chandao-BugStatus')
    let data = []
    let head = ['content', 'title', 'typeId', 'point', 'fixUser']
    if (!_d) {
        window.alert('缓存数据为NULL')
        return
    }
    data.push(head)
    _d.forEach(item => {
        if (item.content === '已解决') {
            let arr = []
            head.forEach(col => {
                arr.push(item[col])
            })
            data.push(arr)
        }
    })
    console.log(data)
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const new_workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(new_workbook, worksheet, "SheetJS");
    XLSX.writeFile(new_workbook, `D:\\chrome download\\json_to_excel-${(new Date()).toLocaleDateString('ko-KR')}.xlsx`);
})
viewCloseBugDom.addEventListener('click', (e) => {
    console.log(store.get('chandao-BugStatus'))
    let _d = store.get('chandao-BugStatus')
    let data = []
    let head = ['typeId', 'title', 'committer_name']
    const pureArr = []
    data.push(head)
    if (!_d) {
        window.alert('缓存数据为NULL')
        return
    }
    _d.forEach(item => {
        if (item.content === '已关闭' && !item.develop2Master) {
            if (!pureArr.includes(item.typeId)) {
                pureArr.push(item.typeId)
            } else {
                return
            }
            let arr = []
            head.forEach(col => {
                arr.push(item[col])
            })
            data.push(arr)
        }
    })
    console.log(data)
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const new_workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(new_workbook, worksheet, "SheetJS");
    XLSX.writeFile(new_workbook, `D:\\chrome download\\json_to_excel-${(new Date()).toLocaleDateString('ko-KR')}.xlsx`);
})

dateEndInput.addEventListener('change', (event) => {
    dateObj.endTime = event.target.value
})

setEndTime = async (value) => {
    dateObj.endTime = value
}

setStartTime = async (value) => {
    dateObj.startTime = value
}

getBranchMsg = async (value) => {
    let cacheData = store.get('chandao-BugStatus')
    let gitBranchValue = value || 'develop'
    let _url = _urlFun(gitBranchValue)
    let _urlMaster = _urlFun('production')

    if (dateObj.startTime) {
        _url += `&since=${dateObj.startTime}`
        _urlMaster += `&since=${dateObj.startTime}`
    } if (dateObj.endTime) {
        _url += `&until=${dateObj.endTime}`
        _urlMaster += `&until=${moment(new Date()).add(1, 'days').format("YYYY-MM-DD")}`
    }
    let data = []
    let master_data = []
    let typeId = new Set()
    let typeObj = {}

    async function getDevelopData(page = 1) {
        await fetch(`${_url}&page=${page}`, httpConfig).then(response => {
            return response.json()
        }).then(async d => {
            if (d.length >= 100) {
                let _p = page
                _p++
                await getDevelopData(_p)
            }
            data = [...d, ...data]
        })
    }

    async function getMasterData(page = 1) {
        await fetch(`${_urlMaster}&page=${page}`, httpConfig).then(res => {
            return res.json()
        }).then(async master => {
            if (master.length >= 100) {
                let _p = page
                _p++
                await getMasterData(_p)
            }
            master_data = [...master, ...master_data]
        })
    }

    function getTypeId(item) {
        let commitMsgF = item.title.split('&')
        if (commitMsgF[1]) {
            return parseInt(commitMsgF[1])
        }
    }

    await getDevelopData()
    await getMasterData()
    console.log(data, master_data)

    let develop2MasterObj = {}
    master_data.reverse().forEach(m => {
        let typeIdM = parseInt(getTypeId(m))
        let value = null
        if (m.title.indexOf('Revert') === -1) {
            value = true
        }
        develop2MasterObj[m.title] = value
    })
    data.reverse().forEach(d => {
        let typeIdD = parseInt(getTypeId(d))
        d.develop2Master = ''
        if (develop2MasterObj[d.title]) {
            d.develop2Master = develop2MasterObj[d.title]
        }
    })
    data.reverse().forEach(item => {
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
    let typeIdArr = Array.from(typeId)
    let _typeIdArr = []
    let num6Arr = []
    typeIdArr.forEach((item, index) => {
        num6Arr.push(item)
        if ((index + 1) % 6 === 0 || ((typeIdArr.length === index + 1) && (index + 1) % 6 !== 0)) {
            _typeIdArr.push(JSON.parse(JSON.stringify(num6Arr)))
            num6Arr = []
        }
    })
    const { browser } = await createPage('', false)
    let page = await browser.newPage()
    page.goto(`${urlName}/user-login.html`, { waitUntil: 'domcontentloaded' })
    await page.waitFor(4000)
    await login(page)
    gitBranchAllDom.innerHTML = typeIdArr.length
    for (let y = 0; y < _typeIdArr.length; y++) {
        let inArr = _typeIdArr[y]
        // _typeIdArr.forEach(async inArr => {
        console.log('nexttick')
        await Promise.all(inArr.map(async (item, index) => {
            // for (let x = 0; x < inArr.length; x++) {
            // let index = x
            // let item = inArr[x]
            try {
                let page = await browser.newPage()
                await page.goto(`${urlName}/bug-view-${item}.html`, { waitUntil: 'domcontentloaded' })
                await page.waitForSelector('.status-bug')
                await page.waitForSelector('#legendBasicInfo table>tbody>tr:nth-child(11)>td')
                await page.waitForSelector('#legendLife table>tbody>tr:nth-child(3)>td')
                await page.waitForSelector('#legendLife table>tbody>tr:nth-child(2)>td')
                await page.waitForSelector('.page-title > span:nth-child(2)')
                await page.waitForSelector('#legendBasicInfo table>tbody>tr:nth-child(6)>td>span')
                let fixContent = await page.$eval('#legendLife table>tbody>tr:nth-child(3)>td', el => el.innerText);
                let bugBranch = await page.$eval('#legendLife table>tbody>tr:nth-child(2)>td', el => el.innerText);
                let pointContent = await page.$eval('#legendBasicInfo table>tbody>tr:nth-child(11)>td', el => el.innerText);
                let content = await page.$eval('.status-bug', el => el.innerText);
                let title = await page.$eval('.page-title > span:nth-child(2)', el => el.innerText)
                let rank = await page.$eval('#legendBasicInfo table>tbody>tr:nth-child(6)>td>span', el => el.innerText)
                typeObj[item] = {
                    content,
                    status: '成功',
                    point: pointContent,
                    fixUser: fixContent,
                    title,
                    rank,
                    bugBranch
                }
                // const isHave = await getDataMsg(item)

                let cacheRow = null
                if (cacheData) {
                    for (let x = 0; x < cacheData.length; x++) {
                        if (cacheData[x]['typeId'] === item) {
                            cacheRow = cacheData[x]
                            break;
                        }
                    }
                }
                try {
                    if (cacheRow) {
                        if (!cacheRow.qiniu) {
                            console.log(1, 'qiniu create')
                            // await page.screenshot({ path: `./utils/img/${item}.png`, fullPage: true });
                            // formUploader(item, `D:\\github\\autoJs\\electronChanDao\\utils\\img\\${item}.png`)
                        } else {
                            for (let x = 0; x < data.length; x++) {
                                if (data[x]['typeId'] === cacheRow['typeId'] && cacheRow['content'] !== typeObj[item]['content']) {
                                    // await deleteData(item)
                                    // await page.screenshot({ path: `./utils/img/${item}.png`, fullPage: true });
                                    // formUploader(item, `D:\\github\\autoJs\\electronChanDao\\utils\\img\\${item}.png`)
                                    console.log('qiniu update')
                                    break;
                                }
                            }
                        }
                    } else {
                        console.log(3, 'qiniu create')
                        // await page.screenshot({ path: `./utils/img/${item}.png`, fullPage: true });
                        // formUploader(item, `D:\\github\\autoJs\\electronChanDao\\utils\\img\\${item}.png`)
                    }
                    typeObj[item]['qiniu'] = true
                } catch (e) {
                    console.log('qiniu：', e)
                }
                await page.close()
            } catch (e) {
                console.log(e)
                typeObj[item] = {
                    content: e.toString(),
                    status: '失败'
                }
            }
            console.log(typeIdArr.length, Object.keys(typeObj).length)
            gitBranchRequestedDom.innerHTML = Object.keys(typeObj).length
            if (typeIdArr.length === Object.keys(typeObj).length) {
                deleteImg('D:\\github\\autoJs\\electronChanDao\\utils\\img')
                data.forEach(item => {
                    if (typeObj[item.typeId]) {
                        item.content = typeObj[item.typeId]['content']
                        item.status = typeObj[item.typeId]['status']
                        item.point = typeObj[item.typeId]['point']
                        item.fixUser = typeObj[item.typeId]['fixUser']
                        item.titleSelf = typeObj[item.typeId]['title']
                        item.qiniu = typeObj[item.typeId]['qiniu']
                        item.type += '--' + typeObj[item.typeId]['rank']
                        item.bugBranch = typeObj[item.typeId]['bugBranch']
                    }
                })
                store.set('chandao-BugStatus', data)
                // await browser.close();
                console.log(data, typeObj)
            }
            // }
        }))
        // })
    }
}

cherryPick = async (typeId) => {
    const { browser } = await createPage('', false)
    let page = await browser.newPage()
    await page.setViewport({ width: 1366, height: 625 })
    page.goto(`${gitlabUrl}/users/sign_in`, { waitUntil: 'domcontentloaded' })
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    console.log('sign_in.html')
    await page.type('#user_login', gitLabName);
    await page.type('#user_password', gitLabPass);
    await page.click('input[type=submit]');
    await page.waitFor(2000)
    console.log('login')
    page.goto(`${gitlabUrl}/front/presap-nifty-react/commits/develop?utf8=✓&search=1909`, { waitUntil: 'domcontentloaded' })
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    await page.screenshot({ path: `./utils/img/login.png`, fullPage: true });
}

onSolvedHandle = async (layer, obj, callback) => {
    let cacheData = store.get('chandao-BugStatus')
    if (!cacheData) {
        window.alert('缓存数据为NULL')
        return
    }
    const layerIndex = layer.open({
        content: '正在操作，请稍等'
    });
    const { browser } = await createPage('', false)
    let page = await browser.newPage()

    page.goto(`${urlName}/user-login.html`, { waitUntil: 'domcontentloaded' })
    await page.waitFor(2000)
    await login(page)
    await page.goto(`${urlName}/bug-view-${obj.typeId}.html`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#legendBasicInfo table>tbody>tr:nth-child(11)>td')
    let pointContent = await page.$eval('#legendBasicInfo table>tbody>tr:nth-child(11)>td', el => el.innerText);
    await page.waitForSelector('.btn-toolbar > a:nth-last-child(6)')
    let solved = await page.$eval('.btn-toolbar > a:nth-last-child(6)', el => el.innerText);
    if (solved === ' 解决' && pointContent.indexOf('凌明') > -1) {
        await page.click('.btn-toolbar > a:nth-last-child(6)')
        await page.waitFor(3000)
        const elementHandle = await page.$('#iframe-triggerModal');
        const frame = await elementHandle.contentFrame();
        await frame.waitForSelector('#resolution')
        await frame.select('#resolution', 'fixed')
        await frame.waitForSelector('#resolvedBuild')
        await frame.select('#resolvedBuild', 'trunk')

        const textArea = await frame.childFrames()[1]
        await textArea.waitForSelector('.article-content')
        await textArea.evaluate(() => document.querySelector('.article-content').innerText = '前端已fix/done，待发包后，请测试。 --Auto');
        await page.waitFor(1000)
        await page.click('#triggerModal')
        await frame.click('button[type=submit]')
        console.log('请求成功')

        cacheData.forEach(item => {
            if (item.id === obj.id)
                item.content = '已解决'
        })
        await deleteData(obj.typeId)
        await page.screenshot({ path: `./utils/img/${obj.typeId}.png`, fullPage: true });
        await formUploader(obj.typeId, `D:\\github\\autoJs\\electronChanDao\\utils\\img\\${obj.typeId}.png`)
        store.set('chandao-BugStatus', cacheData)

        layer.close(layerIndex)
        callback && callback(cacheData)
        // await page.waitFor(3000)
        // await page.screenshot({ path: `./utils/img/${obj.typeId}.png`, fullPage: true });
    }
}
module.exports = {
    main,
    cherryPick,
    onSolvedHandle,
    store,
    getBranchMsg,
    setEndTime,
    setStartTime
}