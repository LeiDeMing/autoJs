const express = require('express'),
    app = express(),
    bodyParser = require('body-parser');
const admin = require('./router/admin.js'),
    setSchedule = require('./middlewares/setSchedule'),
    gotoPage = require('./controllers/gotoPage'),
    getHtml=require('./middlewares/getHtml'),
    getDyttMovie=require('./utils/dytt');
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

// setSchedule(config._date, async () => {
//     // getHtml(config._selfBlog, '.post-title-link',gotoPage);
//     // getHtml(config._juejinUrl, '.abstract-row .title',gotoPage);
// })
getDyttMovie();
// console.log(`https://movie.douban.com/j/subject_suggest?q=${encodeURI('叶问外传')}`)

console.log(`服务开启，端口${config._port}`)
app.listen(config._port);