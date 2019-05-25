const puppeteer = require('puppeteer'),
    fs = require('fs');
const config = require('../../config/index'),
    { deleteImg } = require('../index'),
    mongoDB = require('../../db/index.js'),
    setLogOptions = require('../../common/log'),
    setSchedule = require('../../middlewares/setSchedule');

const logger = setLogOptions('dyjy');
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
        const pageNav = await page.$eval('#pages', el => el.innerText);
        pageAll = pageNav.split(':')[1].split('页首页')[0].split('/')[1];
    } catch (e) {
        logger.error(e)
    }

    try {
        await deepYear({
            page, hrefList, movieData, pageSize, pageAll, maxYear, minYear
        })
    } catch (e) {
        logger.error(e);
    }
}

async function deepYear(deepYearOpt) {
    try {
        let { page, hrefList, movieData, pageSize, pageAll, maxYear = 2019, minYear = 2002 } = deepYearOpt
        minYear++;
        await deepPage({
            page, hrefList, movieData, pageSize, pageAll, maxYear, minYear
        })
        if (minYear <= maxYear) {
            await deepYear(deepYearOpt)
        }
    } catch (e) {
        logger.error(e);
    }
}

async function deepPage(deepPageOpt) {
    let { page, hrefList, movieData, pageSize, pageAll, maxYear, minYear } = deepPageOpt
    let dyjyUrl = `http://www.idyjy.com/w.asp?p=${pageSize}&f=3&n=${minYear}&l=s`;
    await page.goto(dyjyUrl)
    let aList = await page.$$('.play-img');
    for (let x = 0; x < aList.length; x++) {
        let jsHandleObj = await aList[x].getProperty('href');
        const { value } = jsHandleObj._remoteObject;
        hrefList.push(value)
    }
    await deepMovie({
        hrefList, page, movieData, maxYear, minYear
    })
    pageSize++;
    if (pageSize <= pageAll) {
        await deepPage(deepPageOpt);
    }
}

async function deepMovie(options) {
    let { hrefList, page, movieData, maxYear, minYear } = options
    try {
        await page.goto(hrefList[0]);
        let name = await page.$eval('#name', el => el.innerText);
        let textdesc = await page.$eval('.textdesc', el => el.innerText);
        let imgSrc = await page.$eval('.pic img', el => el.src);//info
        let downSrc = await page.$eval('input[name="down_url_list_0"]', el => el.value);
        let score = await page.$eval('#filmStarScore', el => el.innerText);
        let info = await page.$$eval('.info ul li', el => {
            let textArr = []
            for (let x = 0; x < el.length; x++) {
                textArr.push(el[x].innerText)
            }
            return textArr
        });
        let movieObj = {
            name,
            textdesc,
            imgSrc,
            year: minYear,
            thunder: downSrc,
            score,
            info,
            create_time: new Date().toString()
        }
        movieData.push(movieObj);
        hrefList.shift();
        await mongoDB.save('movie_list', movieObj, (err, result) => {
            if (err) throw err
        })
        if (!!hrefList.length) {
            await deepMovie(options)
        }
    }catch(e){
        logger.error(e)
    }finally{
        deepMovie(options)
    }
}
async function main() {

    await getMovieFromDyjy();
}

module.exports = main