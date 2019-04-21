const express = require('express'),
    app = express(),
    bodyParser = require('body-parser');
const admin = require('./router/admin.js'),
    api = require('./router/api.js'),
    setSchedule = require('./middlewares/setSchedule'),
    gotoPage = require('./controllers/gotoPage'),
    getHtml = require('./middlewares/getHtml'),
    {getMoviewFromRedis,getDyttMovie} = require('./utils/dytt'),
    email = require('./utils/email');
let config = require('./config/index');

app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json


app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use('/admin', admin);
app.use('/api', api);

app.use('*', function (req, res) {
    res.status('403');
    res.render('403');
})

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// setSchedule(config.date, async () => {
//     getHtml(config.selfBlog, '.post-title-link', gotoPage);
//     getHtml(config.juejinUrl, '.abstract-row .title', gotoPage);
// });
// setSchedule('1 1 8 * * *', async () => {
//     getDyttMovie()
//         .then(res => {
//             let html = ''
//             res.forEach((curr, index) => {
//                 html += `
//             <div>
//                 <a href="${curr.link}">${curr.title}</a>
//             </div>
//             `
//             })
//             email.setEmail({
//                 from: '2623024110@qq.com',
//                 to: '136371773@qq.com',
//                 subject: '最新电影(来自Nei服务器)',
//                 html: html
//             })
//         })
// });
// getDyttMovie()
//         .then(res => {
//             let html = ''
//             // res.forEach((curr, index) => {
//             //     html += `
//             // <p  style="font-size:14px;">
//             //     <ahref="${curr.link}">${curr.title}</a> <strong>豆瓣：</strong><span>${curr.rating}</span>
//             // </p>
//             // `
//             // })
//             // email.setEmail({
//             //     from: '2623024110@qq.com',
//             //     to: '136371773@qq.com',
//             //     subject: '最新电影(来自Nei服务器)',
//             //     html: html
//             // })
//         })
// getMoviewFromRedis()

console.log(`服务开启，端口${config.port}`)
app.listen(config.port,'192.168.43.157');