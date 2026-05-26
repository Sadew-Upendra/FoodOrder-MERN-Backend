const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedException } = require('../utils/errorClasses');

/**
 * Verifies the Bearer JWT token and attaches the full User document to req.user.
 * Mirrors: AuthFilter.java  →  OncePerRequestFilter
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedException('No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load fresh user from DB — mirrors UserDetailServiceIMPL
    const user = await User.findOne({ email: decoded.email }).select('-password');
    if (!user) {
      return next(new UnauthorizedException('User not found'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(new UnauthorizedException('Invalid or expired token'));
  }
};

module.exports = { protect };
