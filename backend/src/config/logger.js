const winston = require('winston');
const path = require('path');

// Define log level based on environment
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
);

const logger = winston.createLogger({
  level,
  format: logFormat,
  transports: [
    // 1. Log errors to logs/error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: winston.format.json()
    }),
    // 2. Log combined entries to logs/combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: winston.format.json()
    })
  ]
});

// 3. Log colorized messages to console in development/non-production envs
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(info => {
        const reqIdStr = info.metadata?.requestId ? ` [ReqID: ${info.metadata.requestId}]` : '';
        const metaStr = Object.keys(info.metadata).filter(k => k !== 'requestId').length > 0
          ? ` ${JSON.stringify(info.metadata)}` 
          : '';
        return `${info.timestamp} [${info.level}]${reqIdStr}: ${info.message}${metaStr}`;
      })
    )
  }));
}

module.exports = logger;
