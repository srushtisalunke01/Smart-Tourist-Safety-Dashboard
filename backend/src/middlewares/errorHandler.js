const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const reqId = req.requestId || 'N/A';
  logger.error(`[REST] Catastrophic failure occurred: ${err.message}`, { requestId: reqId, stack: err.stack });

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;
