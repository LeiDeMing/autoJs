const puppeteer = require('puppeteer'),
    fs = require('fs');
const config = require('../../config/index'),
    { deleteImg } = require('../index'),
    setSchedule = require('../../middlewares/setSchedule');


async function getMovieFromDyjy() {
    let browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    let pageSize = 1;
    let maxYear = 2019;
    let minYear = 2002
    let pageAll = 1
    let hrefList = []
    let hrefListIndex = 0
    const movieData = []
    const domSelector = [{
        type: 'single',
        value: '#name',
        key: 'name'
    },
    {
        type: 'double',
        value: '.info ul li',
        key: 'info'
    },
    {
        type: 'single',
        value: '.textdesc',
        key: 'textdesc'
    },
    {
        type: 'single',
        value: '.pic img',
        key: 'imgSrc'
    }]
    let dyjyUrl = `http://www.idyjy.com/w.asp?p=${pageSize}&f=3&n=${maxYear}&l=s`;
    try {
        await page.goto(dyjyUrl);
    } catch (e) {
        console.log(e)
    }
    const pageNav = await page.$eval('#pages', el => el.innerText);
    pageAll = pageNav.split(':')[1].split('页首页')[0].split('/')[1];

    // let aList = await page.$$('.play-img');
    // for (let x = 0; x < aList.length; x++) {
    //     let jsHandleObj = await aList[x].getProperty('href');
    //     const { value } = jsHandleObj._remoteObject;
    //     hrefList.push(value)
    // }
    // await deepMovie({
    //     hrefList, page, movieData
    // })

    await deepPage({
        page, hrefList, movieData, pageSize, pageAll, maxYear
    })
}

async function deepPage(deepPageOpt) {
    let { page, hrefList, movieData, pageSize, pageAll, maxYear } = deepPageOpt
    let dyjyUrl = `http://www.idyjy.com/w.asp?p=${pageSize}&f=3&n=${maxYear}&l=s`;
    await page.goto(dyjyUrl)
    let aList = await page.$$('.play-img');
    for (let x = 0; x < aList.length; x++) {
        let jsHandleObj = await aList[x].getProperty('href');
        const { value } = jsHandleObj._remoteObject;
        hrefList.push(value)
    }
    await deepMovie({
        hrefList, page, movieData,maxYear
    })
    pageSize++
    if (pageSize <= pageAll) {
        await deepPage(deepPageOpt);
    }
}

async function deepMovie(options) {
    let { hrefList, page, movieData,maxYear } = options
    await page.goto(hrefList[0]);
    let name = await page.$eval('#name', el => el.innerText);
    let textdesc = await page.$eval('.textdesc', el => el.innerText);
    let imgSrc = await page.$eval('.pic img', el => el.src);//down_list
    let downSrc = await page.$eval('input[name="down_url_list_0"]', el => el.value);
    movieData.push({
        name,
        textdesc,
        imgSrc,
        year:maxYear,
        thunder:downSrc
    });
    hrefList.shift();
    if (!!hrefList.length) {
        await deepMovie(options)
    }
}

async function main() {
    await getMovieFromDyjy();
}

module.exports = main