// const Redis = require('ioredis');
// const config=require('../config/index'),
//         logger=require('../common/log');

// const client = new Redis({
//     port: config.redis_port,
//     host: config.redis_host,
//     db: config.redis_db,
//     password: config.redis_password,
// });

// client.on('error',(e)=>{
//     if(e){
//         logger.error(e);
//         process.exit(1);//?
//     }
// });

// module.exports=client
