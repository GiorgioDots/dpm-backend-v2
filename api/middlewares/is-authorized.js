const jwt = require("jsonwebtoken");
const config = require("../../config");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, config.security.jwt_secret, {
      issuer: config.security.jwt_issuer,
    });
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  if (decodedToken.userId) {
    req.userId = decodedToken.userId;
  }
  next();
};
