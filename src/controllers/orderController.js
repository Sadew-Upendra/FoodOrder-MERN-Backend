const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const User = require('../models/User');
const idGenerator = require('../utils/idGenerator');
const { DataNotFoundException, BadRequestException } = require('../utils/errorClasses');

/**
 * Maps an Order document → OrderResponseDto shape.
 * Mirrors: MappingDtoEntity.toOrderResponseDto() + toOrderItemResponseDto()
 * Optionally embeds nested PaymentResponseDto.
 */
const toOrderDto = (order, payment = null) => ({
  orderId: order.orderId,
  userId: order.userId,
  userName: order.userName,
  orderItems: (order.items || []).map((item) => ({
    orderItemId: item._id.toString(),
    foodItemId: item.foodItemId,
    foodItemName: item.foodItemName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: parseFloat((item.unitPrice * item.quantity).toFixed(2)),
  })),
  totalAmount: order.totalAmount,
  status: order.status,
  orderDate: order.orderDate,
  deliveryAddress: order.deliveryAddress,
  payment: payment
    ? {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paymentDate: payment.paymentDate,
      transactionId: payment.transactionId,
    }
    : null,
});

/** Enriches order with its payment (if any) */
const enrichOrder = async (order) => {
  const payment = await Payment.findOne({ orderId: order.orderId });
  return toOrderDto(order, payment);
};

// === POST /api/v1/orders ===
const placeOrder = async (req, res, next) => {
  try {
    const { deliveryAddress } = req.body;
    const userId = req.user.userId;

    const user = await User.findOne({ userId });
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return next(new BadRequestException('Cannot place order with an empty cart'));
    }

    // Convert cart items → order item snapshots (price locked at order time)
    const orderItems = cart.items.map((ci) => ({
      foodItemId: ci.foodItemId,
      foodItemName: ci.foodItemName,
      quantity: ci.quantity,
      unitPrice: ci.unitPrice,   // snapshot — mirrors OrderItemEntity.unitPrice
    }));

    const order = await Order.create({
      orderId: idGenerator.orderId(),
      userId,
      userName: user ? user.name : null,
      items: orderItems,
      totalAmount: cart.totalPrice,
      status: 'PLACED',
      orderDate: new Date(),
      deliveryAddress,
    });

    // Clear cart after order — mirrors OrderServiceImpl.placeOrder() cart clearing
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json(toOrderDto(order));
  } catch (err) {
    next(err);
  }
};

// === GET /api/v1/orders/my ===
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ orderDate: -1 });
    const result = await Promise.all(orders.map(enrichOrder));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// === GET /api/v1/orders/:orderId ===
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return next(new DataNotFoundException(`Order not found: ${req.params.orderId}`));
    res.status(200).json(await enrichOrder(order));
  } catch (err) {
    next(err);
  }
};

// === GET /api/v1/orders  (ADMIN) ===
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    const result = await Promise.all(orders.map(enrichOrder));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// === PUT /api/v1/orders/:orderId/status?status=PREPARING  (ADMIN) ===
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.query;
    const validStatuses = ['PLACED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return next(new BadRequestException(`Invalid status. Allowed: ${validStatuses.join(', ')}`));
    }

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return next(new DataNotFoundException(`Order not found: ${req.params.orderId}`));

    order.status = status;
    await order.save();
    res.status(200).json(await enrichOrder(order));
  } catch (err) {
    next(err);
  }
};

// === PUT /api/v1/orders/:orderId/cancel ===
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return next(new DataNotFoundException(`Order not found: ${req.params.orderId}`));

    // Ownership check — mirrors OrderServiceImpl.cancelOrder()
    if (order.userId !== req.user.userId) {
      return next(new BadRequestException('You can only cancel your own orders'));
    }
    if (order.status === 'DELIVERED') {
      return next(new BadRequestException('Delivered orders cannot be cancelled'));
    }
    if (order.status === 'CANCELLED') {
      return next(new BadRequestException('Order is already cancelled'));
    }

    order.status = 'CANCELLED';
    await order.save();
    res.status(200).json('Order cancelled successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder };
