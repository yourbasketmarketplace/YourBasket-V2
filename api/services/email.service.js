const nodemailer = require("nodemailer");

const EMAIL_SUBJECTS = {
    "info": "",
    "subscription": "",
    "alert":""
}

exports.sendEmail = (subject, email_to, email_msg) => {
    email_recipients = typeOf(email_to) == Array ? email_to.join(',') : email_to
    let transporter = nodemailer.createTransport({
        host: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let info = await transporter.sendMail({
        from: process.env.EMAIL_USER, // sender address
        to: email_recipients, // list of receivers
        subject: EMAIL_SUBJECTS[subject], // Subject line
        text: email_msg, // plain text body
        // html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
}