const schedule = require('node-schedule'),
    puppeteer = require('puppeteer'),
    superagent=require('superagent');


function setSchedule(date, callback) {
    // *    *    *    *    *    *
    // ┬    ┬    ┬    ┬    ┬    ┬
    // │    │    │    │    │    │
    // │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
    // │    │    │    │    └───── month (1 - 12)
    // │    │    │    └────────── day of month (1 - 31)
    // │    │    └─────────────── hour (0 - 23)
    // │    └──────────────────── minute (0 - 59)
    // └───────────────────────── second (0 - 59, OPTIONAL)
    schedule.scheduleJob(date, callback);
}

async function gotoPage(_url){
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page=await browser.newPage();
    await page.goto(_url);
    console.log('执行完毕');
    await browser.close();
}

function setSuperagent(_url,_method,_data,_params,_cookies){
    _method=_method || 'get';
    return new Promise((resolve,reject)=>{
        superagent(_method,_url)
        .query(_params)
        .send(_data)
        .set('Content-Type','application/x-www-form-urlencoded')
        .end((err,res)=>{
            if(err) reject(err);
            resolve(res);
        })
    })
}

module.exports = {
    setSchedule,
    gotoPage,
    setSuperagent
}