const User = require('../models/User');
const { DataNotFoundException } = require('../utils/errorClasses');

/**
 * Maps a User document → UserDto shape (no password, no internal _id)
 * Mirrors: MappingDtoEntity.toUserDto()
 */
const toUserDto = (user) => ({
  userId: user.userId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
});

// === GET /api/v1/users/me ===
const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json(toUserDto(req.user));
  } catch (err) {
    next(err);
  }
};

// === GET /api/v1/users  (ADMIN) ===
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users.map(toUserDto));
  } catch (err) {
    next(err);
  }
};

// === GET /api/v1/users/:userId  (ADMIN) ===
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('-password');
    if (!user) return next(new DataNotFoundException(`User not found: ${req.params.userId}`));
    res.status(200).json(toUserDto(user));
  } catch (err) {
    next(err);
  }
};

// === PUT /api/v1/users/:userId  (ADMIN) ===
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return next(new DataNotFoundException(`User not found: ${req.params.userId}`));

    // Only patch fields that are present — mirrors UserServiceImpl null-field checks
    const { name, email, phone, address, role } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (role !== undefined) user.role = role;

    await user.save();
    res.status(200).json('User updated successfully');
  } catch (err) {
    next(err);
  }
};

// === DELETE /api/v1/users/:userId  (ADMIN) ===
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return next(new DataNotFoundException(`User not found: ${req.params.userId}`));
    await User.deleteOne({ userId: req.params.userId });
    res.status(200).json('User deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCurrentUser, getAllUsers, getUserById, updateUser, deleteUser };
