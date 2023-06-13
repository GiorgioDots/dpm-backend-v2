const { body, validationResult } = require("express-validator");

const User = require("../../models/user");
const {
  checkValueByRegEx,
  checkUserExistsByEmail,
  checkUserExistsByUsername,
  checkUserNotExistsByEmail,
} = require("./shared");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.$!%*?&])[A-Za-z\d@.$!%*?&]{8,}$/;

const passwordAllowedSpecialCharacters = "@.$!%*?&";

const checkForgotPasswordSessionValidity = async (value) => {
  try {
    const user = await User.findOne({
      $and: [
        { _id: value },
        { forgotPasswordCompleted: false },
        { forgotPasswordExpirationDate: { $gt: new Date(Date.now()).toISOString() } },
      ],
    });
    if (!user) {
      return Promise.reject('The request is no more valid');
    }
  } catch (err) {
    console.log(err);
    return Promise.reject('An error occurred');
  }
};

exports.loginValidation = [
  body("login")
    .not()
    .isEmpty()
    .withMessage("Login is required")
    .isString()
    .withMessage("Login must be a string"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .custom((value) => {
      return checkValueByRegEx(value, passwordRegex, `Wrong login/password`);
    }),
];

exports.signupValidation = [
  body("username")
    .not()
    .isEmpty()
    .withMessage("Username is required")
    .isString()
    .trim()
    .custom(checkUserExistsByUsername),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .isString()
    .trim()
    .isEmail()
    .withMessage("Email not valid")
    .normalizeEmail()
    .custom(checkUserExistsByEmail),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .custom((value) => {
      return checkValueByRegEx(
        value,
        passwordRegex,
        `Password must be minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character [${passwordAllowedSpecialCharacters}]`
      );
    }),
  body("gdprAgree")
    .not()
    .isEmpty()
    .withMessage("You must send if you agree to the gdpr")
    .isBoolean()
    .withMessage("gdprAgree myst be a boolean value"),
];

exports.forgotPasswordValidation = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .isString()
    .trim()
    .isEmail()
    .withMessage("Email not valid")
    .normalizeEmail()
    .custom(checkUserNotExistsByEmail),
];

exports.passwordResetValidation = [
  body('userId')
    .not()
    .isEmpty()
    .withMessage('The id is required')
    .isString()
    .withMessage('The id must be a string')
    .custom(checkForgotPasswordSessionValidity),
  body('newPassword')
    .not()
    .isEmpty()
    .withMessage('NewPassword is required')
    .isString()
    .withMessage('NewPassword must be a string')
    .custom((value) => {
      return checkValueByRegEx(
        value,
        passwordRegex,
        `Password must be minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character [${passwordAllowedSpecialCharacters}]`
      );
    }),
];