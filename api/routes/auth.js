const express = require("express");
const {
  login,
  signup,
  forgotPassword,
  deleteUser,
  passwordReset,
} = require("../controllers/auth");
const {
  loginValidation,
  signupValidation,
  forgotPasswordValidation,
  passwordResetValidation
} = require("../validators/auth");
const isAuth = require("../middlewares/is-authorized");

const router = express.Router();

router.post("/login", loginValidation, login);

router.post("/signup", signupValidation, signup);

router.delete("/delete-account", isAuth, deleteUser);

router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

router.post("/password-reset", passwordResetValidation, passwordReset);

module.exports = router;
