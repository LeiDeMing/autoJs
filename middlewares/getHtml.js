const cheerio = require('cheerio');
const setSuperagent = require('../controllers/setSuperagent');

async function getHtml(_url, str, callback) {
    const _res = await setSuperagent(_url);
    const $ = cheerio.load(_res.text);
    const aList = $(str);
    const {
        req: {
            socket: {
                _host
            }
        }
    } = _res;
    callback && callback(aList, _host);
}


module.exports = getHtml;