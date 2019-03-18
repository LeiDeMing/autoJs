// const superagent = require('superagent');
const logger=require('../common/log');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

function setSuperagent(options) {
    let {url, method, data, params, cookies,charset}=options;
    method = method || 'get';
    return new Promise((resolve, reject) => {
        superagent(method, url)
            .query(params)
            .send(data)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .charset(charset || 'utf-8')
            .buffer(true)
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