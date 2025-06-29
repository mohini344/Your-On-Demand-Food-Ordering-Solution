import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/', authenticate, authorize('customer'), async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    // Calculate total price and validate items
    let totalPrice = 0;
    const orderItems = [];
    let restaurantId = null;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (!restaurantId) {
        restaurantId = product.restaurant;
      } else if (restaurantId.toString() !== product.restaurant.toString()) {
        return res.status(400).json({ message: 'All items must be from the same restaurant' });
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const order = new Order({
      customer: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      totalPrice,
      deliveryAddress: deliveryAddress || req.user.address,
      paymentMethod
    });

    await order.save();

    // Clear user's cart
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    // Populate order details
    await order.populate('customer', 'name email phone');
    await order.populate('restaurant', 'name phone address');
    await order.populate('items.product', 'name imageUrl');

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer orders
router.get('/my-orders', authenticate, authorize('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name')
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get restaurant orders
router.get('/restaurant-orders', authenticate, authorize('restaurant'), async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.user._id })
      .populate('customer', 'name phone address')
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (restaurant only)
router.patch('/:id/status', authenticate, authorize('restaurant'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.user._id },
      { status },
      { new: true }
    ).populate('customer', 'name phone')
     .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Restrict access based on role
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'restaurant') {
      query.restaurant = req.user._id;
    }
    // Admin can see all orders

    const order = await Order.findOne(query)
      .populate('customer', 'name email phone address')
      .populate('restaurant', 'name phone address')
      .populate('items.product', 'name imageUrl description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;