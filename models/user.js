const mongoose = require('mongoose');
const crypto = require('crypto');
const cryptHelper = require('../modules/crypto');

const Schema = mongoose.Schema;

const User = new Schema(
  {
    hashedUsername: {
      type: String,
      required: true,
    },
    hashedEmail: {
      type: String,
      required: true,
      unique: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    gdprAgree: {
      type: Boolean,
      required: true,
    },
    forgotPasswordExpirationDate: Date,
    forgotPasswordCompleted: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

User.methods.encryptPassword = function (password) {
  return crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512');
};

User.methods.encryptEmail = function (email) {
  return cryptHelper.encrypt(email);
};

User.methods.encryptUsername = function (username) {
  return cryptHelper.encrypt(username);
};

User.virtual('password')
  .set(function (password) {
    this._plainPassword = password;
    if (!this.salt) {
      this.salt = crypto.randomBytes(128).toString('hex');
    }
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._plainPassword;
  });

User.virtual('email')
  .set(function (email) {
    this.hashedEmail = this.encryptEmail(email);
  })
  .get(function () {
    return cryptHelper.decrypt(this.hashedEmail);
  });

User.virtual('username')
  .set(function (usename) {
    this.hashedUsername = this.encryptEmail(usename);
  })
  .get(function () {
    return cryptHelper.decrypt(this.hashedUsername);
  });

User.methods.checkPassword = function (password) {
  return this.encryptPassword(password) == this.hashedPassword;
};

module.exports = mongoose.model('User', User);
