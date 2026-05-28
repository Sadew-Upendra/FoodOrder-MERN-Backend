const router = require('express').Router();
const { body } = require('express-validator');
const {
  placeOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validate');

// All order routes require authentication
router.use(protect);

// POST /api/v1/orders              — place order from cart
router.post(
  '/',
  [body('deliveryAddress').notEmpty().withMessage('Delivery address is required')],
  validate,
  placeOrder
);

// GET  /api/v1/orders/my           — current user's orders
// NOTE: /my must be declared BEFORE /:orderId so Express matches it first
router.get('/my', getMyOrders);

// PUT  /api/v1/orders/:orderId/status?status=PREPARING  — ADMIN only
router.put('/:orderId/status', adminOnly, updateOrderStatus);

// PUT  /api/v1/orders/:orderId/cancel
router.put('/:orderId/cancel', cancelOrder);

// GET  /api/v1/orders              — ADMIN: all orders
// NOTE: This must be declared BEFORE /:orderId so it matches /orders not /:orderId
router.get('/', adminOnly, getAllOrders);

// GET  /api/v1/orders/:orderId     — single order (must be last)
router.get('/:orderId', getOrderById);

module.exports = router;
