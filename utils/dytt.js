const getDownLink=require('../middlewares/getDownLink');


async function getDyttMovie(){
    const movieList=await getDownLink('https://www.dytt8.net/','.co_content2>ul a');
    const movieArr=[];
    for(let x=0,len=movieList.length;x<len;x++){
        let targetMovie=await getDownLink(`https://www.dytt8.net${movieList[x].attribs.href}`,'td[bgcolor] a');
        let title=await getDownLink(`https://www.dytt8.net${movieList[x].attribs.href}`,'h1 font');
        movieArr.push({
            title:title && title.eq(0).text(),
            link:targetMovie && targetMovie[0] && targetMovie[0].attribs.href
        });
        console.log(movieArr)
    }
    
}


module.exports=getDyttMovie