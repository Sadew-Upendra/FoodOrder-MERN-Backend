const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    foodItemId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: null },
    status: { type: String, enum: ['AVAILABLE', 'OUT_OF_STOCK'], default: 'AVAILABLE', required: true },
    // Stores categoryId string (not ObjectId ref) — mirrors the Spring Boot custom-ID design
    categoryId: { type: String, required: true },
  },
  { timestamps: true }
);

// Text index for search (mirrors FoodItemRepository.findByNameContainingIgnoreCase)
foodItemSchema.index({ name: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);
