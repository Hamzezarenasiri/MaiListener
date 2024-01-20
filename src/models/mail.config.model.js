const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const mailConfigSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      private: false, // used by the toJSON plugin
    },
    domain: {
      type: String,
      required: false,
      trim: true,
    },
    tls: {
      type: Boolean,
      default: true,
    },
    port: {
      type: Number,
      default: 993,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
mailConfigSchema.plugin(toJSON);
mailConfigSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
mailConfigSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const emailConfig = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!emailConfig;
};

mailConfigSchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef Mail
 */
const MailConfig = mongoose.model('MailConfig', mailConfigSchema);

module.exports = MailConfig;
