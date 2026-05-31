/**
 * Base Application Operational Error
 */
export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'APP_ERROR';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error for 400 responses
 */
export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.validationErrors = fields;
  }
}

/**
 * Not Found Error for 404 responses
 */
export class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Resource not found', 404, 'NOT_FOUND');
  }
}

/**
 * External Integration Error for 502 responses
 */
export class ExternalAPIError extends AppError {
  constructor(message) {
    super(message || 'External API integration failure', 502, 'EXTERNAL_SERVICE_FAILURE');
  }
}
