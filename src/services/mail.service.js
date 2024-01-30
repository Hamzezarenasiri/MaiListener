/**
 * A module for sending and receiving emails using various email providers.
 * @module emailUtils
 */
const nodemailer = require('nodemailer');
const { MailListener } = require('mail-listener5');
const console = require('console');
const { google } = require('googleapis');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const ReceivedMail = require('../models/received.mail.model');
const config = require('../config/config');
const { extractNameAndEmailFromString } = require('../utils/emailTools');
const { parseDateStringToUTC } = require('../utils/dateTools');

/**
 * Queries for emails in a MongoDB database.
 * @param {Object} filter - The MongoDB filter.
 * @param {Object} options - The query options.
 * @param {string} [options.sortBy] - The sort option in the format: sortField:(desc|asc).
 * @param {number} [options.limit] - The maximum number of results per page (default = 10).
 * @param {number} [options.page] - The current page (default = 1).
 * @returns {Promise<QueryResult>} The query result.
 */
const queryEmails = async (filter, options) => {
  const emails = await ReceivedMail.paginate(filter, options);
  logger.debug('Emails:', emails);
  return emails;
};

/**
 * Extracts the email address and name from the given headers.
 * @param {Object} headers - The email headers.
 * @param {string} key - The key of the header to extract.
 * @returns {Object} The extracted email address and name.
 */
function extractAddress(headers, key) {
  const { email, name } = extractNameAndEmailFromString(headers[key]);
  return { value: [{ address: email, name }] };
}

/**
 * Processes a received email message.
 * @param {Object} msg - The email message.
 * @param {Object} mailInfo - The information about the email.
 * @returns {Promise<void>} A promise that resolves when the message is processed.
 */
async function processMessage(msg, mailInfo) {
  const headers = msg.payload.headers.reduce((acc, obj) => {
    acc[_.camelCase(obj.name)] = obj.value;
    return acc;
  }, {});
  const mail = {
    headers,
    from: extractAddress(headers, 'from'),
    to: extractAddress(headers, 'to'),
    subject: headers.subject,
    messageId: headers.messageId,
    date: parseDateStringToUTC(headers.date),
  };
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const emailExists = await ReceivedMail.exists({ messageId: mail.messageId });
    if (!emailExists) {
      await ReceivedMail.create({
        messageId: mail.messageId,
        email: mailInfo.email,
        user_id: mailInfo.user_id,
        email_id: mailInfo.email_id,
        mail,
      });
      logger.debug(`New Email Received: ${mail.subject}`);
    }
  } catch (error) {
    logger.error('Error processing message:', error);
  }
}

/**
 * Listens for new emails in a Gmail account.
 * @param {Object} gmail - The Gmail API client.
 * @param {Object} mailInfo - The information about the email account.
 */
function GmailListener(gmail, mailInfo) {
  const checkMail = (gmaill, mailInfoo) => {
    gmaill.users.messages.list(
      {
        userId: mailInfoo.user_id,
        labelIds: 'INBOX',
        maxResults: 10,
      },
      (err, res) => {
        if (err) {
          logger.error('Error listing messages:', err);
          return;
        }

        const { messages } = res.data;

        if (messages && messages.length > 0) {
          messages.forEach((message) => {
            gmaill.users.messages.get(
              {
                userId: mailInfoo.email,
                id: message.id,
              },
              async (getMessageErr, getMessageRes) => {
                if (getMessageErr) {
                  console.error('Error getting message details:', getMessageErr);
                  return;
                }

                const email = getMessageRes.data;
                await processMessage(email, mailInfoo);
              }
            );
          });
        } else {
          logger.debug('No new messages.');
        }
      }
    );
  };
  checkMail(gmail, mailInfo);
}

/**
 * Sends an email using the nodemailer library.
 * @param {Object} mailBody - The email body.
 * @returns {Promise<Object>} A promise that resolves with the sent email.
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
 * Receives new emails from a Gmail account.
 * @param {Object} mailInfo - The information about the email account.
 */
const receiveGmail = async (mailInfo) => {
  const oAuth2Client = new google.auth.OAuth2(config.google.clientId, config.google.clientSecret);
  oAuth2Client.setCredentials({ access_token: mailInfo.accessToken, refresh_token: mailInfo.refreshToken });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const setupGmailWatch = async () => {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const response = await gmail.users.watch({
        userId: mailInfo.email,
        resource: {
          labelIds: ['INBOX'],
          topicName: 'projects/maillistener-412210/topics/MailListener',
        },
      });
      logger.info('Gmail watch response:', response.data);
    } catch (error) {
      logger.error('Error setting up Gmail watch:', error.message);
      // If the error is due to unauthorized, you might need to refresh the token
      if (error.message === 'User not authorized to perform this action') {
        // Refresh the access token
        const refreshedToken = await oAuth2Client.getAccessToken();
        oAuth2Client.setCredentials({ access_token: refreshedToken.token });
        // Retry setting up Gmail watch
        await setupGmailWatch();
      }
    }
  };
  await setupGmailWatch();
  GmailListener(gmail, mailInfo);
};

/**
 * Receives new emails from an IMAP server.
 * @param {Object} mailInfo - The information about the email account.
 */
const receiveMail = async (mailInfo) => {
  if (mailInfo.refreshToken) {
    receiveGmail(mailInfo);
  } else {
    const mailListener = new MailListener({
      clientId: mailInfo.clientId,
      clientSecret: mailInfo.clientSecret,
      refreshToken: mailInfo.refreshToken,
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

    mailListener.on('server:disconnected', () => {
      logger.error('imapDisconnected');
    });

    mailListener.on('error', (err) => {
      logger.error(err);
    });
  }
};

const getGmailDetails = async function getGmailDetails(data, messageId) {
  const decodeDate = jwt.decode(data);
  const userId = decodeDate.emailAddress;
  const oAuth2Client = new google.auth.OAuth2(config.google.clientId, config.google.clientSecret);
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  const response = await gmail.users.messages.get({ userId, id: messageId });
  return response.data;
};

module.exports = {
  sendMail,
  receiveMail,
  receiveGmail,
  queryEmails,
  getGmailDetails,
};
