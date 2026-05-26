const { AppError } = require('../utils/errorClasses');

// Centralised error handler — mirrors @ControllerAdvice GlobalExceptionHandler
const errorHandler = (err, req, res, next) => {
  // Express-validator errors (mirrors MethodArgumentNotValidException → 400 with field map)
  if (err.type === 'validation') {
    return res.status(400).json({
      status: 400,
      message: 'Validation failed',
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose duplicate key (unique index violation → 409)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: 409,
      message: `Duplicate value for field: ${field}`,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose CastError (invalid ObjectId → 400)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 400,
      message: `Invalid value for field: ${err.path}`,
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors (→ 401)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 401,
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }

  // Our custom operational errors (AppError subclasses)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Unknown / programming errors — don't leak details
  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json({
    status: 500,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
