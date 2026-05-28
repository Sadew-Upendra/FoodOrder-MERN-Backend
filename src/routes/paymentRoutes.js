const router = require('express').Router();
const { body } = require('express-validator');
const { processPayment, getPaymentByOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

// All payment routes require authentication
router.use(protect);

// POST /api/v1/payments
router.post(
  '/',
  [body('orderId').notEmpty().withMessage('Order ID is required')],
  validate,
  processPayment
);

// GET  /api/v1/payments/order/:orderId
router.get('/order/:orderId', getPaymentByOrder);

module.exports = router;
