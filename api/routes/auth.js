const express = require("express");
const authCtrl = require("../controllers/auth");
const authValidators = require("../validators/auth");
const isAuth = require("../middlewares/is-authorized");
const { body } = require("express-validator");

const router = express.Router();

router.post("/login", authValidators.loginValidation, authCtrl.login);

router.post("/signup", authValidators.signupValidation, authCtrl.signup);

router.delete("/delete-account", isAuth, authCtrl.deleteUser);

router.post(
  "/forgot-password",
  authValidators.forgotPasswordValidation,
  authCtrl.forgotPassword
);

router.post(
  "/password-reset",
  authValidators.passwordResetValidation,
  authCtrl.passwordReset
);

router.post(
  "/refresh-token",
  [
    body("refreshToken")
      .not()
      .isEmpty()
      .withMessage("RefreshToken is required")
      .isString()
      .trim(),
  ],
  authCtrl.refreshToken
);

module.exports = router;
