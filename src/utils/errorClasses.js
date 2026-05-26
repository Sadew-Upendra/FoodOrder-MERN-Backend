class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class DataNotFoundException extends AppError {
  constructor(message) { super(message, 404); }
}

class DuplicateResourceException extends AppError {
  constructor(message) { super(message, 409); }
}

class BadRequestException extends AppError {
  constructor(message) { super(message, 400); }
}

class UnauthorizedException extends AppError {
  constructor(message) { super(message || 'Unauthorized', 401); }
}

class ForbiddenException extends AppError {
  constructor(message) { super(message || 'Forbidden', 403); }
}

class DataSaveException extends AppError {
  constructor(message) { super(message, 500); }
}

module.exports = {
  AppError,
  DataNotFoundException,
  DuplicateResourceException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  DataSaveException,
};
