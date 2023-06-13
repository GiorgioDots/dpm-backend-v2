const { body, validationResult } = require("express-validator");
const User = require("../../models/user");
const cryptoHelper = require("../../modules/crypto");

exports.validateRequest = (request) => {
  const errors = validationResult(request);
  if (errors.isEmpty()) {
    return;
  }
  const error = new Error("Validation failed");
  error.statusCode = 422;
  error.errors = errors.array();
  throw error;
};

exports.checkValueByRegEx = (value, regex, withMessage) => {
  const isValidate = regex.test(value);
  if (!isValidate) {
    throw new Error(withMessage);
  }
  return true;
};

exports.checkUserExistsByUsername = async (value) => {
  try {
    const hashedUsername = cryptoHelper.encrypt(value);
    const user = await User.findOne({ hashedUsername: hashedUsername });
    if (user) {
      return Promise.reject("Username already exists");
    }
  } catch (err) {
    console.error(err);
    return Promise.reject("An error occurred");
  }
};

exports.checkUserExistsByEmail = async (value) => {
  try {
    const hashedEmail = cryptoHelper.encrypt(value);
    const user = await User.findOne({ hashedEmail: hashedEmail });
    if (user) {
      return Promise.reject("Email already exists");
    }
  } catch (err) {
    console.error(err);
    return Promise.reject("An error occurred");
  }
};

exports.checkUserNotExistsByEmail = async (value) => {
  try {
    const hashedEmail = cryptoHelper.encrypt(value);
    const user = await User.findOne({ hashedEmail: hashedEmail });
    if (!user) {
      return Promise.reject("Email not found");
    }
  } catch (err) {
    console.error(err);
    return Promise.reject("An error occurred");
  }
};

exports.checkForgotPasswordSessionValidity = async (value) => {
  try {
    const user = await User.findOne({
      $and: [
        { _id: value },
        { forgotPasswordCompleted: false },
        {
          forgotPasswordExpirationDate: {
            $gt: new Date(Date.now()).toISOString(),
          },
        },
      ],
    });
    if (!user) {
      return Promise.reject("The request is no more valid");
    }
  } catch (err) {
    console.log(err);
    return Promise.reject("An error occurred");
  }
};
