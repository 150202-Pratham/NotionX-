// const nodemailer = require("nodemailer");

// const mailSender = async (email, title, body) => {
//     try{
//         console.log("MAIL_HOST:", process.env.MAIL_HOST);
//         console.log("MAIL_USER:", process.env.MAIL_USER);
//             let transporter = nodemailer.createTransport({
//                 host:process.env.MAIL_HOST,
//                 port: 465,
//                 secure: false,
//                 auth:{
//                     user: process.env.MAIL_USER,
//                     pass: process.env.MAIL_PASS,
//                 }
//             })
            
//             await transporter.verify();
//             console.log("SMTP READY");

//             let info = await transporter.sendMail({
//                 from: `"NotionX" <${process.env.MAIL_USER}>`,
//                 to:`${email}`,
//                 subject: `${title}`,
//                 html: `${body}`,
//             })
//             console.log(info);
//             return info;
//     }
//     catch(error) {
//         console.log(error.message);
//         throw error;
//     }
// }

console.log("BREVO_API_KEY =", process.env.BREVO_API_KEY);

const axios = require("axios");

const mailSender = async (email, title, body) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "NotionX",
          email: "notionx.edu.in@gmail.com",
        },
        to: [
          {
            email: email,
          },
        ],
        subject: title,
        htmlContent: body,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent successfully");
    return response.data;
  } catch (error) {
    console.error(
      "Brevo API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = mailSender;
