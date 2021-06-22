const nm = require('nodemailer');
require('dotenv').config()

exports.contactForm = (req, res) => {
   const {toemail, email, usermessage, name} = req.body;
   let transporter = nm.createTransport({
    port: 465,
    service: "gmail",
    auth: {
        user: 'abanerjee763@gmail.com',
        pass: '03432582357',
    },
    secure: false

    })
   var message = {
        from: email,
        to: toemail,
        subject: 'Contact Mail',
        html: `<h1>Sent by ${name}</h1><br/><p>${usermessage}</p>`
    };

    transporter.sendMail(message, (err,success) => {
        if(err){
            console.log(err);
            res.status(400).json({
                error: err
            });
            
        }

        res.status(200).json({
            success: true
        })
    })
};

exports.contactBlogAuthorForm = (req, res) => {
    

    const {authorEmail, email, usermessage, name} = req.body;
    let transporter = nm.createTransport({
     port: 465,
     service: "gmail",
     auth: {
         user: 'abanerjee763@gmail.com',
         pass: '03432582357',
     },
     secure: false
 
     })
    var message = {
         from: email,
         to: authorEmail,
         subject: 'Contact Mail',
         html: `<h1>Sent by ${name}</h1><br/><p>${usermessage}</p>`
     };
 
     transporter.sendMail(message, (err,success) => {
         if(err){
             console.log(err);
             res.status(400).json({
                 error: err
             });
             
         }
 
         res.status(200).json({
             success: true
         })
     })
};