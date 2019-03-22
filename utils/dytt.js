const getDownLink=require('../middlewares/getDownLink'),
        utils=require('./index'),
        client=require('../common/redis');

async function getDyttMovie(){
    const $home=await getDownLink({
        url:'https://www.dytt8.net/',
        charset:'gbk'
    });
    const movieList=$home('.co_content2>ul a');
    const movieArr=[];
    for(let x=0,len=movieList.length;x<len;x++){
        if(utils.getObjLen(movieList[x].attribs)===0 ) continue;
        let $list=await getDownLink({
            url:`https://www.dytt8.net${movieList[x].attribs.href}`,
            charset:'gbk'
        });
        let targetMovie=$list('td[bgcolor] a');
        let title=$list('h1 font');
        let img=$list('#Zoom>span img');
        targetMovie.length>0 &&  movieArr.push({
            title:title && title.eq(0).text(),
            link:targetMovie[0].attribs.href,
            img:img.map((i,val)=>{
                return val.attribs.src
            })
        });
        if(x===4) break;
    }
    client.sadd('dytt',movieArr);
    return movieArr;
}


module.exports=getDyttMovie