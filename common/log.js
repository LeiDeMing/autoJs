const log4js = require('log4js');
const config=require('../config/index');

log4js.configure({
    appenders: {
        cheese: {
            type: 'file',
            filename: `${config._log}cheese.log`
        }
    },
    categories: {
        default: {
            appenders: ['cheese'],
            level: 'debug'
        }
    }
});

module.exports=log4js