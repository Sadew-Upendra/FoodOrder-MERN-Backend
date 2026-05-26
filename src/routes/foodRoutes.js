const router = require('express').Router();
const { body } = require('express-validator');
const { getAllFoods, getFoodById, createFood, updateFood, deleteFood } = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validate');

const foodValidation = [
  body('name').notEmpty().trim().withMessage('Food item name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').notEmpty().withMessage('Category ID is required'),
  body('status').optional().isIn(['AVAILABLE', 'OUT_OF_STOCK']).withMessage('Invalid status'),
];

// GET  /api/v1/foods              — Public (optional ?categoryId= or ?search=)
router.get('/', getAllFoods);

// GET  /api/v1/foods/:foodItemId  — Public
router.get('/:foodItemId', getFoodById);

// POST /api/v1/foods              — ADMIN only
router.post('/', protect, adminOnly, foodValidation, validate, createFood);

// PUT  /api/v1/foods/:foodItemId  — ADMIN only
router.put('/:foodItemId', protect, adminOnly, foodValidation, validate, updateFood);

// DELETE /api/v1/foods/:foodItemId — ADMIN only
router.delete('/:foodItemId', protect, adminOnly, deleteFood);

module.exports = router;
