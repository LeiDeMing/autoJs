const cheerio = require('cheerio');
const setSuperagent = require('../controllers/setSuperagent');


async function getDownLink(options) {
    let {
        url,
        method,
        data,
        params,
        cookies,
        charset,
        selector
    } = options;
    try {
        const _html = await setSuperagent({
            url,
            method,
            data,
            params,
            cookies,
            charset
        });
        const $ = cheerio.load(_html.text);
        // return $(selector);
        return $;
    } catch (e) {
        // console.log(e)
        return null;
    }
}

module.exports = getDownLink;