const router = require('express').Router();
const { body } = require('express-validator');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

// All cart routes require authentication
router.use(protect);

// GET    /api/v1/cart
router.get('/', getCart);

// POST   /api/v1/cart/add
router.post(
  '/add',
  [
    body('foodItemId').notEmpty().withMessage('Food item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  addToCart
);

// PUT    /api/v1/cart/items/:cartItemId?quantity=3
router.put('/items/:cartItemId', updateCartItem);

// DELETE /api/v1/cart/items/:cartItemId
router.delete('/items/:cartItemId', removeCartItem);

// DELETE /api/v1/cart/clear
router.delete('/clear', clearCart);

module.exports = router;
