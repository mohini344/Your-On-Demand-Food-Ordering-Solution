import express from 'express';
import Product from '../models/Product.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, restaurant, search } = req.query;
    let query = { isAvailable: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (restaurant) {
      query.restaurant = restaurant;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('restaurant', 'name cuisineType')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('restaurant', 'name cuisineType address phone');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (restaurant only)
router.post('/', authenticate, authorize('restaurant'), async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      restaurant: req.user._id
    });

    await product.save();
    await product.populate('restaurant', 'name cuisineType');

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (restaurant only)
router.put('/:id', authenticate, authorize('restaurant'), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      restaurant: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.imageUrl = imageUrl || product.imageUrl;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

    await product.save();
    await product.populate('restaurant', 'name cuisineType');

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (restaurant only)
router.delete('/:id', authenticate, authorize('restaurant'), async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      restaurant: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;