const getDownLink = require('../../middlewares/getDownLink'),
    utils = require('../index'),
    logger = require('../../common/log'),
    client = require('../../common/redis')
    setSuperagent=require('../../controllers/setSuperagent');

async function getDyttMovie() {
    try {
        const $home = await getDownLink({
            url: 'https://www.dytt8.net/',
            charset: 'gbk'
        });
        const movieList = $home('.co_content2>ul a');
        const movieArr = [];
        for (let x = 0, len = movieList.length; x < len; x++) {
            if (utils.getObjLen(movieList[x].attribs) === 0) continue;
            let $list = await getDownLink({
                url: `https://www.dytt8.net${movieList[x].attribs.href}`,
                charset: 'gbk'
            });
            let targetMovie = $list('td[bgcolor] a');
            let title = $list('h1 font');
            let img = $list('#Zoom>span img');
            let reg=/(?<=《)(.*?)(?=》)/;
            let titleText=title && title.eq(0).text();
            let doubanData;
            let detail;
            let pureImg=[]
            //豆瓣api需解决连续调用锁IP问题
            // if(titleText.match(reg)){
            //     doubanData=await fetch(`https://api.douban.com/v2/movie/search?q=${encodeURIComponent(titleText.match(reg)[1])}`)
            // }
            // doubanData=await fetch(`https://api.douban.com/v2/movie/search?q=${titleText.match(reg) && titleText.match(reg)[1]}`)
            // doubanData && (await doubanData.json().then(res=>{
            //     detail=res
            // })
            let imgArrr=img.map((i, val) => {
                return val.attribs.src
            })
            if(imgArrr){
                for(let y=0,yLen=imgArrr.length;y<yLen;y++){
                    pureImg.push(imgArrr[y])
                }
            }
            targetMovie.length > 0 && movieArr.push({
                title: title && title.eq(0).text(),
                link: targetMovie[0].attribs.href,
                img: pureImg,
                movieLength:len-1
                // detail
                // rating:detail && detail['subjects'][0]['rating']['average']
            });
            console.log(movieArr)
            if(x==5) break;
        }
        // client.sadd('dytt', JSON.stringify(movieArr));
        // return buble(movieArr);
        return movieArr;
    } catch (e) {
        logger.error(e)
    }
}


function getMoviewFromRedis(){
    client.get('dytt',(err,res)=>{
        console.log(res)
    })
}

module.exports = {
    getDyttMovie,
    getMoviewFromRedis
}