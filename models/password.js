const mongoose = require('mongoose');

const cryptHelper = require('../modules/crypto');

const Schema = mongoose.Schema;

const Password = new Schema(
  {
    url: String,
    hashedLogin: String,
    hashedSecondLogin: String,
    notes: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

Password.virtual('password')
  .set(function (password) {
    this.hashedPassword = cryptHelper.encrypt(password);
  })
  .get(function () {
    return cryptHelper.decrypt(this.hashedPassword);
  });

Password.virtual('login')
  .set(function (login) {
    this.hashedLogin = cryptHelper.encrypt(login);
  })
  .get(function () {
    return cryptHelper.decrypt(this.hashedLogin);
  });

Password.virtual('secondLogin')
  .set(function (secondLogin) {
    this.hashedSecondLogin = cryptHelper.encrypt(secondLogin);
  })
  .get(function () {
    return cryptHelper.decrypt(this.hashedSecondLogin);
  });

module.exports = mongoose.model('Password', Password);
