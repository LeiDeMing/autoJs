const puppeteer = require('puppeteer'),
    fs = require('fs');

puppeteer.launch().then(async browser => {
    const page = await browser.newPage();
    await page.goto('http://wap.idyjy.com/sub/32050.html');
    const pageNav = await page.$$('.dramaNumList');
    const aList = await pageNav[1].$$('a')
    let hrefList = []
    for(let x=0;x<aList.length;x++){
        if(x<=32) continue
        let jsHandleObj = await aList[x].getProperty('href');
        const { value } = jsHandleObj._remoteObject;
        hrefList.push(value)
    }
    // console.log(hrefList.join(' '))
    fs.appendFile('log.txt', hrefList.join('\n'), function (err) { 
        if (err) { 
        // append failed 
        } else { 
        // done 
        } 
    })
    await browser.close();
});