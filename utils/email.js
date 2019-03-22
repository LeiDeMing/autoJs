const nodemailer = require("nodemailer");
const config =require('../config/index');
// const smtpTransport = require('nodemailer-smtp-transport');

let transporter = nodemailer.createTransport({
    host:config.emailHost, // qq邮箱主机
    secure: true,
    secureConnection: true,
    auth: {
        user:config.fromEmail ,
        pass: config.smtp
    }
})

async function setEmail(options) {
    let {from,to,subject,html}=options
    let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        // text: 'Hello World!',
        html: html
    }

    try {
        let info=await transporter.sendMail(mailOptions);
        console.log(info)
    }catch(e){
        console.log(e)
    }
    
}
module.exports={
    setEmail
}