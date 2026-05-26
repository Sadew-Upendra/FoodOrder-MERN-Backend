const router = require('express').Router();
const { body } = require('express-validator');
const { login, signup } = require('../controllers/authController');
const { validate } = require('../middleware/validate');

// POST /api/v1/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// POST /api/v1/auth/signup
router.post(
  '/signup',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  signup
);

module.exports = router;
