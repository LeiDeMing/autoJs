const qiniu = require('qiniu');
const config = require('../config');

const qNconfig = new qiniu.conf.Config();
// 空间对应的机房 z2华南
qNconfig.zone = qiniu.zone.Zone_z2;
const formUploaderCore = new qiniu.form_up.FormUploader(qNconfig);
const putExtra = new qiniu.form_up.PutExtra();
const mac = new qiniu.auth.digest.Mac(config.qiniuAccessKey, config.qiniuSecretKey);
const options = {
    scope: config.qiniuBucket,
};
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

function getPicUrl(key) {
    const mac = new qiniu.auth.digest.Mac(config.qiniuAccessKey, config.qiniuSecretKey);
    const conf = new qiniu.conf.Config();
    const bucketManager = new qiniu.rs.BucketManager(mac, conf);
    const privateBucketDomain = config.qiniuUrl;
    const deadline = parseInt(Date.now() / 1000) + 1800; // 0.5小时过期
    const privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline);
    return privateDownloadUrl
}

async function formUploader(key, localFile) {
    return new Promise((resolve, reject) => {
        formUploaderCore.putFile(uploadToken, key, localFile, putExtra, function (respErr,
            respBody, respInfo) {
            if (respErr) {
                reject(respErr);
            }
            if (respInfo.statusCode == 200) {
                resolve(respBody);
            } else {
                reject({
                    statusCode: respInfo.statusCode,
                    ...respBody
                });
            }
        });
    })
}

module.exports = {
    formUploader,
    getPicUrl
}