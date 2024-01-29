const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const EmailSchema = new mongoose.Schema({
  headers: { type: Object },
  html: String,
  text: String,
  textAsHtml: String,
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  to: {
    value: [
      {
        address: String,
        name: String,
      },
    ],
    html: String,
    text: String,
  },
  from: {
    value: [
      {
        address: String,
        name: String,
      },
    ],
    html: String,
    text: String,
  },
});

const receivedMailSchema = mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    email_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    mail: EmailSchema,
    attributes: {
      date: Date,
      flags: [String],
      uid: Number,
      modseq: String,
      'x-gm-labels': [String],
      'x-gm-msgid': String,
      'x-gm-thrid': String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
receivedMailSchema.plugin(toJSON);
receivedMailSchema.plugin(paginate);

/**
 * @typedef ReceivedMail
 */
const ReceivedMail = mongoose.model('ReceivedMail', receivedMailSchema);

module.exports = ReceivedMail;
