// Base Error Class
class BaseError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
    this.errorCode = errorCode;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request Errors
class BadRequestError extends BaseError {
  constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

class ValidationError extends BadRequestError {
  constructor(errors) {
    const message = `Validation Error: ${errors.join('. ')}`;
    super(message, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class DuplicateError extends BadRequestError {
  constructor(field, value) {
    const message = `Duplicate ${field}: ${value}. Please use another value!`;
    super(message, 'DUPLICATE_VALUE');
  }
}

// 401 Unauthorized Errors
class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

class InvalidTokenError extends UnauthorizedError {
  constructor() {
    super('Invalid token. Please log in again!', 'INVALID_TOKEN');
  }
}

class TokenExpiredError extends UnauthorizedError {
  constructor() {
    super('Your token has expired! Please log in again.', 'TOKEN_EXPIRED');
  }
}

// 403 Forbidden Errors
class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

class InsufficientPermissionsError extends ForbiddenError {
  constructor(requiredRole) {
    super(`Insufficient permissions. Required role: ${requiredRole}`, 'INSUFFICIENT_PERMISSIONS');
  }
}

// 404 Not Found Errors
class NotFoundError extends BaseError {
  constructor(resource, errorCode = 'NOT_FOUND') {
    const message = `${resource} not found`;
    super(message, 404, errorCode);
  }
}

class ResourceNotFoundError extends NotFoundError {
  constructor(resourceType, id) {
    super(`${resourceType} with ID ${id} not found`, 'RESOURCE_NOT_FOUND');
  }
}

// 409 Conflict Errors
class ConflictError extends BaseError {
  constructor(message = 'Conflict', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

// 500 Internal Server Errors
class InternalServerError extends BaseError {
  constructor(message = 'Internal Server Error', errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message, 500, errorCode);
  }
}

class DatabaseError extends InternalServerError {
  constructor(error) {
    super('Database operation failed', 'DATABASE_ERROR');
    this.originalError = error;
  }
}

// Error Handler Functions
const handleCastErrorDB = (err) => {
  return new BadRequestError(`Invalid ${err.path}: ${err.value}`, 'INVALID_INPUT');
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.detail.match(/(["'])(\\?.)*?\1/)[0];
  return new DuplicateError('field', value);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new ValidationError(errors);
};

const handleJWTError = () => new InvalidTokenError();

const handleJWTExpiredError = () => new TokenExpiredError();

// Error Response Formatters
const formatErrorResponse = (error) => ({
  status: error.status,
  statusCode: error.statusCode,
  errorCode: error.errorCode,
  message: error.message,
  timestamp: error.timestamp,
  ...(process.env.NODE_ENV === 'development' && {
    stack: error.stack,
    ...(error.errors && { errors: error.errors }),
    ...(error.originalError && { originalError: error.originalError })
  })
});

// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {
  // Default to 500 if status code not set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // Development error response
    res.status(err.statusCode).json(formatErrorResponse(err));
  } else {
    // Production error response
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === '23505') error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Send formatted error response
    res.status(error.statusCode).json(formatErrorResponse(error));
  }
};

module.exports = {
  // Base Error
  BaseError,
  
  // 400 Errors
  BadRequestError,
  ValidationError,
  DuplicateError,
  
  // 401 Errors
  UnauthorizedError,
  InvalidTokenError,
  TokenExpiredError,
  
  // 403 Errors
  ForbiddenError,
  InsufficientPermissionsError,
  
  // 404 Errors
  NotFoundError,
  ResourceNotFoundError,
  
  // 409 Errors
  ConflictError,
  
  // 500 Errors
  InternalServerError,
  DatabaseError,
  
  // Error Handler
  globalErrorHandler
}; 