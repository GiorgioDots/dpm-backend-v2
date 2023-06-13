const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const winFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(label({ label: "DPM-BACKEND" }), timestamp(), winFormat),
  transports: [new transports.Console()],
});

module.exports = logger;
