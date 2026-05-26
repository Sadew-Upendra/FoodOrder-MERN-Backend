const { ForbiddenException } = require('../utils/errorClasses');

/**
 * Must be used AFTER protect middleware.
 * Mirrors: @PreAuthorize("hasRole('ADMIN')") on controller methods.
 *
 * Usage:  router.get('/', protect, adminOnly, handler)
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new ForbiddenException('Access denied: ADMIN role required'));
  }
  next();
};

module.exports = { adminOnly };
