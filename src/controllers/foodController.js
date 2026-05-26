const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const idGenerator = require('../utils/idGenerator');
const { DataNotFoundException } = require('../utils/errorClasses');

/**
 * Maps FoodItem doc + Category doc → FoodItemResponseDto shape.
 * Mirrors: MappingDtoEntity.toFoodItemResponseDto()
 */
const toFoodItemDto = (food, category) => ({
  foodItemId: food.foodItemId,
  name: food.name,
  description: food.description,
  price: food.price,
  imageUrl: food.imageUrl,
  status: food.status,
  categoryId: food.categoryId,
  categoryName: category ? category.name : null,
});

// Helper: fetch food doc + its category, return DTO
const fetchWithCategory = async (food) => {
  const category = await Category.findOne({ categoryId: food.categoryId });
  return toFoodItemDto(food, category);
};

// === GET /api/v1/foods?categoryId=&search= ===
const getAllFoods = async (req, res, next) => {
  try {
    const { categoryId, search } = req.query;
    let foods;

    if (categoryId) {
      // Mirrors: FoodItemRepository.findByCategoryCategoryId()
      foods = await FoodItem.find({ categoryId });
    } else if (search) {
      // Mirrors: FoodItemRepository.findByNameContainingIgnoreCase()
      foods = await FoodItem.find({ name: { $regex: search, $options: 'i' } });
    } else {
      foods = await FoodItem.find();
    }

    const result = await Promise.all(foods.map(fetchWithCategory));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// === GET /api/v1/foods/:foodItemId ===
const getFoodById = async (req, res, next) => {
  try {
    const food = await FoodItem.findOne({ foodItemId: req.params.foodItemId });
    if (!food) return next(new DataNotFoundException(`Food item not found: ${req.params.foodItemId}`));
    res.status(200).json(await fetchWithCategory(food));
  } catch (err) {
    next(err);
  }
};

// === POST /api/v1/foods  (ADMIN) ===
const createFood = async (req, res, next) => {
  try {
    const { name, description, price, imageUrl, status, categoryId } = req.body;

    const category = await Category.findOne({ categoryId });
    if (!category) return next(new DataNotFoundException(`Category not found: ${categoryId}`));

    const food = await FoodItem.create({
      foodItemId: idGenerator.foodId(),
      name,
      description: description || null,
      price,
      imageUrl: imageUrl || null,
      status: status || 'AVAILABLE',
      categoryId,
    });

    res.status(201).json(toFoodItemDto(food, category));
  } catch (err) {
    next(err);
  }
};

// === PUT /api/v1/foods/:foodItemId  (ADMIN) ===
const updateFood = async (req, res, next) => {
  try {
    const food = await FoodItem.findOne({ foodItemId: req.params.foodItemId });
    if (!food) return next(new DataNotFoundException(`Food item not found: ${req.params.foodItemId}`));

    const { name, description, price, imageUrl, status, categoryId } = req.body;

    const category = await Category.findOne({ categoryId });
    if (!category) return next(new DataNotFoundException(`Category not found: ${categoryId}`));

    food.name = name;
    food.description = description || null;
    food.price = price;
    food.imageUrl = imageUrl || null;
    food.status = status;
    food.categoryId = categoryId;
    await food.save();

    res.status(200).json(toFoodItemDto(food, category));
  } catch (err) {
    next(err);
  }
};

// === DELETE /api/v1/foods/:foodItemId  (ADMIN) ===
const deleteFood = async (req, res, next) => {
  try {
    const food = await FoodItem.findOne({ foodItemId: req.params.foodItemId });
    if (!food) return next(new DataNotFoundException(`Food item not found: ${req.params.foodItemId}`));
    await FoodItem.deleteOne({ foodItemId: req.params.foodItemId });
    res.status(200).json('Food item deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllFoods, getFoodById, createFood, updateFood, deleteFood };
