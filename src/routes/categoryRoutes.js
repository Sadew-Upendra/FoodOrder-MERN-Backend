const router = require('express').Router();
const { body } = require('express-validator');
const {
  getAllCategories, getCategoryById,
  createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validate');

const categoryValidation = [
  body('name').notEmpty().trim().withMessage('Category name is required'),
];

// GET  /api/v1/categories         — Public
router.get('/', getAllCategories);

// GET  /api/v1/categories/:id     — Public
router.get('/:categoryId', getCategoryById);

// POST /api/v1/categories         — ADMIN only
router.post('/', protect, adminOnly, categoryValidation, validate, createCategory);

// PUT  /api/v1/categories/:id     — ADMIN only
router.put('/:categoryId', protect, adminOnly, categoryValidation, validate, updateCategory);

// DELETE /api/v1/categories/:id  — ADMIN only
router.delete('/:categoryId', protect, adminOnly, deleteCategory);

module.exports = router;
