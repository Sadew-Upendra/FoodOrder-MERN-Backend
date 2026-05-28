const Payment = require('../models/Payment');
const Order = require('../models/Order');
const idGenerator = require('../utils/idGenerator');
const { DataNotFoundException, BadRequestException } = require('../utils/errorClasses');

/**
 * Maps a Payment document → PaymentResponseDto shape.
 * Mirrors: MappingDtoEntity.toPaymentResponseDto()
 */
const toPaymentDto = (payment) => ({
  paymentId: payment.paymentId,
  orderId: payment.orderId,
  amount: payment.amount,
  status: payment.status,
  paymentDate: payment.paymentDate,
  transactionId: payment.transactionId,
});

// === POST /api/v1/payments ===
const processPayment = async (req, res, next) => {
  try {
    const { orderId, transactionId } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) return next(new DataNotFoundException(`Order not found: ${orderId}`));

    // Prevent double payment — mirrors PaymentServiceImpl guard
    const existing = await Payment.findOne({ orderId });
    if (existing && existing.status === 'COMPLETED') {
      return next(new BadRequestException(`Payment already completed for order: ${orderId}`));
    }

    const payment = await Payment.create({
      paymentId: idGenerator.paymentId(),
      orderId,
      amount: order.totalAmount,
      status: 'COMPLETED',
      paymentDate: new Date(),
      transactionId: transactionId || null,
    });

    res.status(200).json(toPaymentDto(payment));
  } catch (err) {
    next(err);
  }
};

// === GET /api/v1/payments/order/:orderId ===
const getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return next(new DataNotFoundException(`Payment not found for order: ${req.params.orderId}`));
    res.status(200).json(toPaymentDto(payment));
  } catch (err) {
    next(err);
  }
};

module.exports = { processPayment, getPaymentByOrder };
