const nodemailer = require('nodemailer');
const { MailListener } = require('mail-listener5');
const console = require('console');
const logger = require('../config/logger');
const ReceivedMail = require('../models/received.mail.model');

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryEmails = async (filter, options) => {
  const emails = await ReceivedMail.paginate(filter, options);
  return emails;
};

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
/**
 * receive Mail
 * @returns mailBody
 * @param mailInfo
 */
const receiveMail = async (mailInfo) => {
  const mailListener = new MailListener({
    username: mailInfo.email,
    password: mailInfo.password,
    host: mailInfo.imap_host,
    port: mailInfo.port, // imap port
    tls: true,
    connTimeout: 10000, // Default by node-imap
    authTimeout: 5000, // Default by node-imap,
    debug: console.log, // Or your custom function with only one incoming argument. Default: null
    autotls: 'never', // default by node-imap
    tlsOptions: { rejectUnauthorized: false },
    mailbox: 'INBOX', // mailbox to monitor
    searchFilter: ['UNSEEN'], // the search filter being used after an IDLE notification has been retrieved
    markSeen: false, // all fetched email will be marked as seen and not fetched next time
    fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
    attachments: false, // download attachments as they are encountered to the project directory
    attachmentOptions: { directory: 'media/mail_attachments/' }, // specify a download directory for attachments
  });

  mailListener.start();
  // Event when a new email is received
  mailListener.on('mail', async (mail, seqno, attributes) => {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const emailExists = await ReceivedMail.exists({ messageId: mail.messageId });
      if (!emailExists) {
        ReceivedMail.create({
          messageId: mail.messageId,
          email: mailInfo.email,
          user_id: mailInfo.user_id,
          email_id: mailInfo.email_id,
          mail,
          attributes,
        });
        logger.debug(`New Email Received: ${mail.subject}`);
      }
    } catch (error) {
      logger.error('Error:', error);
      logger.error('Error:', error.message);
    }
  });

  mailListener.on('server:disconnected', function () {
    logger.error('imapDisconnected');
  });

  mailListener.on('error', function (err) {
    console.error(err);
  });
};

module.exports = {
  sendMail,
  receiveMail,
  queryEmails,
};
