const router = require('express').Router();
const { getCurrentUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// GET  /api/v1/users/me  — any authenticated user
router.get('/me', protect, getCurrentUser);

// GET  /api/v1/users      — ADMIN only
router.get('/', protect, adminOnly, getAllUsers);

// GET  /api/v1/users/:userId  — ADMIN only
router.get('/:userId', protect, adminOnly, getUserById);

// PUT  /api/v1/users/:userId  — ADMIN only
router.put('/:userId', protect, adminOnly, updateUser);

// DELETE /api/v1/users/:userId  — ADMIN only
router.delete('/:userId', protect, adminOnly, deleteUser);

module.exports = router;
