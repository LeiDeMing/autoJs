const log4js = require('log4js');
const config=require('../config/index');

function setLogOptions(filename='cheese',appenders='cheese',level='debug'){
    log4js.configure({
        appenders: {
            cheese: {
                type: 'file',
                filename: `${config.log}${filename}.log`
            }
        },
        categories: {
            default: {
                appenders: [appenders],
                level: level
            }
        }
    });
    return log4js.getLogger('cheese');
}
// const logger = setLogOptions
module.exports=setLogOptions