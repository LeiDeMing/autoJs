const puppeteer = require('puppeteer');
const logger=require('../common/log');

async function gotoPage(aList, _host) {
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    let pageArr = [];
    // let page=await browser.newPage();
    // await page.goto(_url);
    try {
        for (let x = 0, len = aList.length; x < len; x++) {
            let random = Math.random() * 10;
            if (random < 5) continue;
            pageArr[x] = await browser.newPage();
            await pageArr[x].goto(`https://${_host}${aList[x].attribs.href}`);

            logger.info(`ok! host:${_host} url：https://${_host}${aList[x].attribs.href}`);
            await pageArr[x].close();
        }

        await browser.close();
    } catch (e) {
        logger.error(e);
        await browser.close();
    } finally {
        await browser.close();
    }
}

module.exports=gotoPage