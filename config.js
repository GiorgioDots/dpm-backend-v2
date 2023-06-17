require("dotenv-safe").config();

const config = {
  mongo_uri: process.env.MONGO_URI,
  port: process.env.PORT || 8080,
  log_level: process.env.LOG_LEVEL,
  appBaseUrl: process.env.APP_BASE_URL,
  rootPath: __dirname,
  security: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_issuer: process.env.JWT_ISSUER,
    jwt_expires_in: process.env.JWT_EXPIRES_IN,
    crypt_key: process.env.CRYPT_KEY,
    crypt_iv: process.env.CRYPT_EV,
    forgot_pwd_expires_in: parseInt(process.env.FORGOT_PWD_EXPIRES_IN),
    refresh_token_expires_in: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
  },
  mailjet: {
    apiKey: process.env.MAILJET_API_KEY,
    secretKey: process.env.MAILJET_SECRET_KEY,
    fromMailAddress: process.env.MAILJET_FROM_MAIL,
    fromName: process.env.MAILJET_FROM_NAME,
    version: "v3.1",
  },
};

module.exports = config;
