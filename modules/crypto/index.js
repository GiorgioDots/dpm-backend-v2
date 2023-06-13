const crypto = require("crypto");

const config = require("../../config");

const algorithm = "aes-256-ctr";
const key = new Buffer.from(config.security.crypt_key, "base64");
const iv = Buffer.from(config.security.crypt_iv, "base64");

exports.encrypt = (text) => {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decrypt = (text) => {
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
