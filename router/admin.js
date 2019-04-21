const express=require('express');
const app=express();
const router=express.Router();
const {getMoviewFromRedis,getDyttMovie} = require('../utils/dytt');

router.get('/',async (req,res)=>{
    res.render('admin/index');
})

module.exports=router;