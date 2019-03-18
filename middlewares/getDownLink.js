const cheerio = require('cheerio');
const setSuperagent = require('../controllers/setSuperagent');


async function getDownLink(url,str){
    try{
        const _html=await setSuperagent(url);
        const $=cheerio.load(_html.text);
        return $(str);
    }catch(e){
        console.log(e)
        return null;
    }
}

module.exports=getDownLink;