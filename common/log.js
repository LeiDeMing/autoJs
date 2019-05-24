const log4js = require('log4js');
const config=require('../config/index');

function setLogOptions(filename='cheese',appenders='cheese',level='level'){
    log4js.configure({
        appenders: {
            cheese: {
                type: 'file',
                filename: `${config.log}cheese.log`
            }
        },
        categories: {
            default: {
                appenders: ['cheese'],
                level: 'debug'
            }
        }
    });
    return log4js.getLogger('cheese');
}
// const logger = setLogOptions
module.exports=setLogOptions