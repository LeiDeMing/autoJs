const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cheerio = require('cheerio');
const admin = require('./router/admin.js'),
    setSchedule = require('./middlewares/setSchedule'),
    agent=require('./middlewares/agent')
    gotoPage = require('./controllers/gotoPage');
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


async function browserPage(_url, str) {
    const _res = await agent(_url);
    const $ = cheerio.load(_res.text);
    const aList = $(str);
    const {
        req: {
            socket: {
                _host
            }
        }
    } = _res;
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