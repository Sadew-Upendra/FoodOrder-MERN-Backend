const mongoose = require('mongoose');

// Embedded cart item — mirrors CartItemEntity
// _id (ObjectId) is used as cartItemId when the frontend updates/removes items
const cartItemSchema = new mongoose.Schema({
  foodItemId: { type: String, required: true },
  foodItemName: { type: String },
  foodItemImage: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
});

// Virtual: quantity × unitPrice — mirrors CartItemEntity.getSubtotal()
cartItemSchema.virtual('subtotal').get(function () {
  return parseFloat((this.unitPrice * this.quantity).toFixed(2));
});

const cartSchema = new mongoose.Schema(
  {
    // One cart per user — mirrors CartEntity's unique JoinColumn on user
    userId: { type: String, required: true, unique: true },
    items: [cartItemSchema],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Recalculate totalPrice from items — mirrors CartEntity.recalculateTotal()
cartSchema.methods.recalculateTotal = function () {
  this.totalPrice = parseFloat(
    this.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0).toFixed(2)
  );
};

module.exports = mongoose.model('Cart', cartSchema);
