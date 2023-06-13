const { format, transports } = require('winston');
const expressWinston = require('express-winston');
const { combine, timestamp, label, printf } = format;

const winFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

exports.expressLogger = expressWinston.logger({
  transports: [new transports.Console()],
  format: combine(label({ label: 'DPM-BACKEND' }), timestamp(), winFormat),
});

exports.expressErrorLogger = expressWinston.errorLogger({
  transports: [new transports.Console()],
  format: combine(label({ label: 'DPM-BACKEND' }), timestamp(), winFormat),
});
