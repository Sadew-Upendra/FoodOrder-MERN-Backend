const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const { DataNotFoundException, BadRequestException } = require('../utils/errorClasses');

/**
 * Maps a Cart document → CartResponseDto shape.
 * Mirrors: MappingDtoEntity.toCartResponseDto() + toCartItemResponseDto()
 *
 * NOTE: cart item _id (ObjectId) is used as `id` so the frontend can
 *       reference items when calling PUT /cart/items/:cartItemId
 */
const toCartDto = (cart) => {
  const items = (cart.items || []).map((item) => ({
    id: item._id.toString(),       // cartItemId used by update/remove endpoints
    foodItemId: item.foodItemId,
    foodItemName: item.foodItemName,
    foodItemImage: item.foodItemImage,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: parseFloat((item.unitPrice * item.quantity).toFixed(2)),
  }));

  return {
    cartId: cart._id.toString(),
    userId: cart.userId,
    items,
    totalPrice: cart.totalPrice,
    totalItems: items.length,
  };
};

/** Find existing cart or create a fresh one — mirrors CartServiceImpl.getOrCreateCart() */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], totalPrice: 0 });
  }
  return cart;
};

// === GET /api/v1/cart ===
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    res.status(200).json(toCartDto(cart));
  } catch (err) {
    next(err);
  }
};

// === POST /api/v1/cart/add ===
const addToCart = async (req, res, next) => {
  try {
    const { foodItemId, quantity } = req.body;

    const food = await FoodItem.findOne({ foodItemId });
    if (!food) return next(new DataNotFoundException(`Food item not found: ${foodItemId}`));

    const cart = await getOrCreateCart(req.user.userId);

    // If item already exists in cart — increment quantity (mirrors CartServiceImpl)
    const existing = cart.items.find((i) => i.foodItemId === foodItemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        foodItemId,
        foodItemName: food.name,
        foodItemImage: food.imageUrl || null,
        quantity,
        unitPrice: food.price,
      });
    }

    cart.recalculateTotal();
    await cart.save();
    res.status(200).json(toCartDto(cart));
  } catch (err) {
    next(err);
  }
};

// === PUT /api/v1/cart/items/:cartItemId?quantity=3 ===
const updateCartItem = async (req, res, next) => {
  try {
    const quantity = parseInt(req.query.quantity, 10);
    const cart = await getOrCreateCart(req.user.userId);

    const item = cart.items.id(req.params.cartItemId);
    if (!item) return next(new DataNotFoundException(`Cart item not found: ${req.params.cartItemId}`));

    if (quantity <= 0) {
      // quantity ≤ 0 removes the item — mirrors CartServiceImpl.updateCartItem()
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    cart.recalculateTotal();
    await cart.save();
    res.status(200).json(toCartDto(cart));
  } catch (err) {
    next(err);
  }
};

// === DELETE /api/v1/cart/items/:cartItemId ===
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);

    const item = cart.items.id(req.params.cartItemId);
    if (!item) return next(new DataNotFoundException(`Cart item not found: ${req.params.cartItemId}`));

    item.deleteOne();
    cart.recalculateTotal();
    await cart.save();
    res.status(200).json(toCartDto(cart));
  } catch (err) {
    next(err);
  }
};

// === DELETE /api/v1/cart/clear ===
const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
    res.status(200).json('Cart cleared');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
