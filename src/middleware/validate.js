const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains.
 * If errors exist, forwards a validation error to the global error handler.
 * Mirrors: @Valid + MethodArgumentNotValidException handling in GlobalExceptionHandler.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap = {};
    errors.array().forEach((e) => {
      errorMap[e.path] = e.msg;
    });
    const err = new Error('Validation failed');
    err.type = 'validation';
    err.errors = errorMap;
    return next(err);
  }
  next();
};

module.exports = { validate };
