const nodemailer = require('nodemailer');

/**
 * send Mail
 * @param {Object} mailBody
 * @returns mailBody
 */
const sendMail = async (mailBody) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // TODO
    auth: {
      user: mailBody.email,
      pass: mailBody.password,
    },
  });
  return transporter.sendMail({
    from: mailBody.email,
    to: mailBody.to,
    subject: mailBody.subject,
    text: mailBody.text,
  });
};

module.exports = {
  sendMail,
};
