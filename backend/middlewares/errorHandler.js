import { ZodError } from 'zod';
import logger from '../utils/logger.js';

/**
 * Express Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Capture complete stack trace via Winston
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });

  // Handle Zod schema validator exceptions
  if (err instanceof ZodError) {
    const validationErrors = {};
    err.errors.forEach(e => {
      // Maps path array to dot notation string
      const field = e.path.filter(p => p !== 'body' && p !== 'query' && p !== 'params').join('.') || 'field';
      validationErrors[field] = e.message;
    });

    return res.status(400).json({
      success: false,
      error: 'Request validation failed',
      code: 'VALIDATION_ERROR',
      fields: validationErrors
    });
  }

  // Handle custom URL validation exceptions thrown by utils/urlParser
  if (err.validationErrors) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'VALIDATION_ERROR',
      fields: err.validationErrors
    });
  }

  // Handle standard application errors with custom status codes
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  return res.status(statusCode).json({
    success: false,
    error: err.message || 'An internal server error occurred.',
    code: errorCode
  });
};

export default errorHandler;
