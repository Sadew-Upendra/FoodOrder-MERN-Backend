const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const idGenerator = require('../utils/idGenerator');
const { DataNotFoundException, DuplicateResourceException } = require('../utils/errorClasses');

/**
 * Maps a Category document → CategoryResponseDto shape.
 * Mirrors: MappingDtoEntity.toCategoryResponseDto()
 * foodItemCount requires a separate DB count so it's passed in explicitly.
 */
const toCategoryDto = (category, foodItemCount = 0) => ({
  categoryId:    category.categoryId,
  name:          category.name,
  description:   category.description,
  imageUrl:      category.imageUrl,
  foodItemCount,
});

// === GET /api/v1/categories ===
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    // Attach food item count to each category
    const result = await Promise.all(
      categories.map(async (cat) => {
        const count = await FoodItem.countDocuments({ categoryId: cat.categoryId });
        return toCategoryDto(cat, count);
      })
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// === GET /api/v1/categories/:categoryId ===
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({ categoryId: req.params.categoryId });
    if (!category) return next(new DataNotFoundException(`Category not found: ${req.params.categoryId}`));

    const count = await FoodItem.countDocuments({ categoryId: category.categoryId });
    res.status(200).json(toCategoryDto(category, count));
  } catch (err) {
    next(err);
  }
};

// === POST /api/v1/categories  (ADMIN) ===
const createCategory = async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;

    const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) return next(new DuplicateResourceException(`Category already exists: ${name}`));

    const category = await Category.create({
      categoryId:  idGenerator.categoryId(),
      name,
      description: description || null,
      imageUrl:    imageUrl    || null,
    });

    res.status(201).json(toCategoryDto(category, 0));
  } catch (err) {
    next(err);
  }
};

// === PUT /api/v1/categories/:categoryId  (ADMIN) ===
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ categoryId: req.params.categoryId });
    if (!category) return next(new DataNotFoundException(`Category not found: ${req.params.categoryId}`));

    const { name, description, imageUrl } = req.body;
    category.name        = name;
    category.description = description || null;
    category.imageUrl    = imageUrl    || null;
    await category.save();

    const count = await FoodItem.countDocuments({ categoryId: category.categoryId });
    res.status(200).json(toCategoryDto(category, count));
  } catch (err) {
    next(err);
  }
};

// === DELETE /api/v1/categories/:categoryId  (ADMIN) ===
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ categoryId: req.params.categoryId });
    if (!category) return next(new DataNotFoundException(`Category not found: ${req.params.categoryId}`));

    // Cascade delete food items — mirrors orphanRemoval = true on CategoryEntity.foodItems
    await FoodItem.deleteMany({ categoryId: category.categoryId });
    await Category.deleteOne({ categoryId: req.params.categoryId });

    res.status(200).json('Category deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
