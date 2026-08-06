const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Assigns a unique X-Request-ID header to trace logs across asynchronous processes
 */
module.exports = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID?.() || crypto.randomBytes(16).toString('hex');
  
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  // Attach logger helper with requestId automatically set
  req.log = (level, message, metadata = {}) => {
    logger.log(level, message, { requestId, ...metadata });
  };

  req.log('info', `[REST] ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    // Log response status code
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    req.log(level, `[REST] Responded with status ${res.statusCode}`);
  });

  next();
};
