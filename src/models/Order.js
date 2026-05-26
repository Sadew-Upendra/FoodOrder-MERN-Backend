const mongoose = require('mongoose');

// Embedded order item — mirrors OrderItemEntity (price snapshot at time of order)
const orderItemSchema = new mongoose.Schema({
  foodItemId: { type: String, required: true },
  foodItemName: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
});

orderItemSchema.virtual('subtotal').get(function () {
  return parseFloat((this.unitPrice * this.quantity).toFixed(2));
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userName: { type: String },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PLACED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'],
      default: 'PLACED',
      required: true,
    },
    orderDate: { type: Date, default: Date.now },
    deliveryAddress: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Order', orderSchema);
