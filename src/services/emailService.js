require("dotenv").config();
import nodemailer from "nodemailer";

let sendSimpleEmail = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_APP, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"NHD 👻" <gsgsrgwzrghrw@gmail.com>', // sender address
    to: dataSend.receiverEmail, // list of receivers
    subject: "Booking information", // Subject line
    html: getBodyHTMLEmail(dataSend), // html body
  });
};

let getBodyHTMLEmail = (dataSend) => {
    let result = '';
    if(dataSend.language === 'vi') {
        result = 
        `
        <h3>Xin chào ${dataSend.patientName}</h3>
        <p>Bạn nhận được email này vì bạn đã đặt lịch khám trên BookingCare website</p>
        <p>Thông tin lịch hẹn: </p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><p>Bác sĩ: ${dataSend.doctorName}</p></div>

        <p>Nếu các thông tin trên là đúng vui lòng nhấn vào đường link dưới để hoàn tất thủ tục đặt lịch hẹn khám</p>
        <div>
            <a href=${dataSend.redirectLink} target='_blank'>Click here</a>
        </div>
        <div>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</div>
        `
    }

    if(dataSend.language === 'en') {
        result = 
        `
        <h3>Hello ${dataSend.patientName}</h3>
        <p>You are receiving this email because you have booked appointment on BookingCare website</p>
        <p>Your appointment information: </p>
        <div><b>Time: ${dataSend.time}</b></div>
        <div><p>Doctor: ${dataSend.doctorName}</p></div>

        <p>If all of above information is correct, please click on the link below to complete the booking process</p>
        <div>
            <a href=${dataSend.redirectLink} target='_blank'>Click here</a>
        </div>
        <div>Thanks you for using our service</div>
        `
    }

    return result;
}

let sendAttachment = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_APP, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"NHD 👻" <gsgsrgwzrghrw@gmail.com>', // sender address
    to: dataSend.email, // list of receivers
    subject: "Bill", // Subject line
    html: getBodyHTMLEmailBill(dataSend), 
    attachments: [
      {
        filename: `bill-${dataSend.patientId} - ${new Date().getTime()}.jpeg`,
        content: dataSend.imgBase64.split("base64,")[1],
        encoding: 'base64'
      }
    ]
  });
}

let getBodyHTMLEmailBill = (dataSend) => {
  let result = '';
  if(dataSend.language === 'vi') {
      result = 
      `
      <h3>Xin chào ${dataSend.patientName}</h3>
      <p>Bạn nhận được email này vì bạn đã đặt lịch khám trên BookingCare website</p>
      <p>Thông tin hoá đơn/thuốc đượcc gửi trong file đính kèm</p>
      <div>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</div>
      `
  }

  if(dataSend.language === 'en') {
      result = 
      `
      <h3>Hello ${dataSend.patientName}</h3>
      <p>You are receiving this email because you have booked appointment on BookingCare website</p>
      <p>Your bill and remedy is attached with this email, please check</p>
      <div>Thanks you for using our service</div>
      `
  }

  return result;
}

module.exports = {
  sendSimpleEmail,
  sendAttachment
};
