const express = require('express'),
    router = express.Router(),
    app = express();
const {getMoviewFromRedis,getDyttMovie} = require('../utils/dytt');

router.get('/movie',async (req,res)=>{
    let data=await getDyttMovie();
    res.jsonp({
        result:'200',
        msg:'successful!',
        data
    })
})

module.exports=router