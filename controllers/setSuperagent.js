const superagent = require('superagent');
const log4js=require('../common/log');
const logger = log4js.getLogger('cheese');

function setSuperagent(_url, _method, _data, _params, _cookies) {
    _method = _method || 'get';
    return new Promise((resolve, reject) => {
        superagent(_method, _url)
            .query(_params)
            .send(_data)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .end((err, res) => {
                if (err){
                    logger.error(err);
                    reject(err);
                }
                resolve(res);
            })
    })
}

module.exports=setSuperagent;