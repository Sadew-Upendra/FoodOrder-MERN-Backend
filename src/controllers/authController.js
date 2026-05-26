const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cart = require('../models/Cart');
const idGenerator = require('../utils/idGenerator');
const { BadRequestException, DuplicateResourceException } = require('../utils/errorClasses');

/**
 * Generates a signed JWT — mirrors JWTUtils.generateToken()
 */
const signToken = (user) =>
  jwt.sign(
    { email: user.email, role: user.role, userId: user.userId },
    process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_EXPIRATION, 10) }
  );

/**
 * Builds the JWTResponseDto shape — mirrors AuthServiceImpl.login() / register() return
 */
const buildAuthResponse = (user, token) => ({
  token,
  userId: user.userId,
  email: user.email,
  name: user.name,
  role: user.role,
});

// === POST /api/v1/auth/login ===
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return next(new BadRequestException('Invalid email or password'));
    }

    const token = signToken(user);
    res.status(200).json(buildAuthResponse(user, token));
  } catch (err) {
    next(err);
  }
};

// === POST /api/v1/auth/signup ===
const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return next(new DuplicateResourceException(`Email already registered: ${email}`));
    }

    // Create user — pre-save hook hashes password automatically
    const user = await User.create({
      userId: idGenerator.userId(),
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || null,
      address: address || null,
      role: 'CUSTOMER',          // Always CUSTOMER on self-register
    });

    // Auto-create empty cart — mirrors AuthServiceImpl.register() cart creation
    await Cart.create({
      userId: user.userId,
      items: [],
      totalPrice: 0,
    });

    const token = signToken(user);
    res.status(201).json(buildAuthResponse(user, token));
  } catch (err) {
    next(err);
  }
};

module.exports = { login, signup };
