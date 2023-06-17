const jwt = require("jsonwebtoken");
const randToken = require("rand-token");

const { validateRequest } = require("../validators/shared");
const crypto = require("../../modules/crypto");
const mailJet = require("../../modules/mailjet");

const User = require("../../models/user");
const Password = require("../../models/password");

const config = require("../../config");

exports.login = async (req, res, next) => {
  try {
    validateRequest(req);
    const hashedLogin = crypto.encrypt(req.body.login);
    const password = req.body.password;

    const user = await User.findOne({
      $or: [{ hashedEmail: hashedLogin }, { hashedUsername: hashedLogin }],
    });

    if (!user) {
      const error = new Error("Login or password are wrong");
      error.statusCode = 422;
      throw error;
    }

    if (!user.checkPassword(password)) {
      const error = new Error("Login or password are wrong");
      error.statusCode = 422;
      throw error;
    }

    let refToken = generateRefreshToken();
    user.refreshToken = refToken.refreshToken;
    user.refreshTokenExpiration = refToken.refreshTokenExpiration;

    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: "Logged in successfully",
      userId: user._id.toString(),
      username: user.username,
      token: token,
      refreshToken: refToken.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    validateRequest(req);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const gdprAgree = req.body.gdprAgree;

    if (!gdprAgree) {
      const error = new Error("You must accept the terms and condition");
      error.statusCode = 422;
      throw error;
    }

    const user = new User({
      username: username,
      email: email,
      password: password,
      gdprAgree: gdprAgree,
    });

    let refToken = generateRefreshToken();
    user.refreshToken = refToken.refreshToken;
    user.refreshTokenExpiration = refToken.refreshTokenExpiration;

    const savedUser = await user.save();

    const token = generateToken(savedUser);

    res.status(201).json({
      message: "Signed up successfully",
      userId: savedUser._id.toString(),
      username: savedUser.username,
      token: token,
      refreshToken: refToken.refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    await user.remove();
    await Password.deleteMany({ userId: req.userId });
    res.status(200).json({
      message: "Account removed successfully, all your data are removed",
    });
  } catch (error) {
    return next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    validateRequest(req);
    const email = req.body.email;
    const hashedEmail = crypto.encrypt(email);
    const user = await User.findOne({ hashedEmail: hashedEmail });

    const expirationDate = new Date(
      Date.now() + config.security.forgot_pwd_expires_in
    );

    user.forgotPasswordExpirationDate = expirationDate.toISOString();
    user.forgotPasswordCompleted = false;

    await user.save();

    const mailInfo = {
      username: user.username,
      action_url: `${config.appBaseUrl}?id=${user.id}&r=password-reset`,
      support_url: `${config.appBaseUrl}/support`,
      browser_name: req.useragent.browser,
      operating_system: req.useragent.os,
    };

    await mailJet.sendForgottenPasswordEmail(
      email,
      "DotsPWDManager password reset request",
      mailInfo
    );

    res.status(200).json({
      message:
        "An email with the password reset link has been sent, check your mailbox",
    });
  } catch (error) {
    return next(error);
  }
};

exports.passwordReset = async (req, res, next) => {
  try {
    validateRequest(req);
    const userId = req.body.userId;
    const newPassword = req.body.newPassword;

    const user = await User.findById(userId);

    user.password = newPassword;
    user.forgotPasswordCompleted = true;
    user.refreshToken = null;
    user.refreshTokenExpiration = null;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    validateRequest(req);
    const refreshToken = req.body.refreshToken;
    const user = await User.findOne({ refreshToken: refreshToken });
    if (user == null || user.refreshTokenExpiration.getTime() < Date.now()) {
      const error = new Error("RefreshToken not valid");
      error.statusCode = 422;
      throw error;
    }
    let refToken = generateRefreshToken();
    user.refreshToken = refToken.refreshToken;
    user.refreshTokenExpiration = refToken.refreshTokenExpiration;

    await user.save();

    let token = generateToken(user);

    res.status(200).json({
      username: user.username,
      token: token,
      refreshToken: refToken.refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
    },
    config.security.jwt_secret,
    {
      issuer: config.security.jwt_issuer,
      expiresIn: config.security.jwt_expires_in,
    }
  );
};

const generateRefreshToken = () => {
  let refToken = randToken.uid(256);
  let refTokenExpiration = new Date(
    Date.now() + config.security.refresh_token_expires_in
  );
  return {
    refreshToken: refToken,
    refreshTokenExpiration: refTokenExpiration,
  };
};
