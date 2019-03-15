const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cheerio = require('cheerio');
const admin = require('./router/admin.js'),
    setSchedule = require('./middlewares/setSchedule'),
    gotoPage = require('./controllers/gotoPage'),
    setSuperagent = require('./controllers/setSuperagent');
let config = require('./config/index');

app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use('/admin', admin);

app.use('*', function (req, res) {
    res.status('403');
    res.render('403');
})

async function _agent(url) {
    const res = await setSuperagent(url);
    return res
}

async function browserPage(_url, str) {
    const _res = await _agent(_url);
    const $ = cheerio.load(_res.text);
    const aList = $(str);
    const {
        req: {
            socket: {
                _host
            }
        }
    } = _res;
    // aList.each((i,val)=>{
    //     let _random=Math.random()*10;
    //     _random>5 && utils.gotoPage(`https://${_host}${val.attribs.href}`);
    // });
    gotoPage(aList, _host);
}

// browserPage(config._selfBlog,'.post-title-link');
// browserPage(config._juejinUrl,'.abstract-row .title')

setSchedule(config._date, async () => {
    browserPage(config._selfBlog, '.post-title-link');
    browserPage(config._juejinUrl, '.abstract-row .title');
})

console.log(`服务开启，端口${config._port}`)
app.listen(config._port);