const logger = require('../utils/logger');

/**
 * Error handling middleware for Express
 * Should be the last middleware registered
 */
function errorHandler(err, req, res, next) {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'DatabaseError') {
    statusCode = 503;
    message = 'Database Service Unavailable';
  }

  if (err.name === 'AIServiceError') {
    statusCode = 503;
    message = 'AI Service Unavailable';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
}

module.exports = errorHandler;
