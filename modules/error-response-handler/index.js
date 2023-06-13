const logger = require("../winston");

module.exports = (error, req, res, next) => {
  const status = error.statusCode || 500;
  let response = {
    message: `${error.message}`,
  };
  if (error.errors) {
    response.errors = error.errors;
  }
  logger.error(error);
  console.error(error);
  res.status(status).json(response);
};