import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get admin dashboard stats
router.get("/stats", authenticate, authorize("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalRestaurants = await User.countDocuments({
      role: "restaurant",
      isApproved: true,
    });
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending restaurants
router.get(
  "/restaurants/pending",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const pendingRestaurants = await User.find({
        role: "restaurant",
        isApproved: false,
      }).select("-password");

      res.json(pendingRestaurants);
    } catch (error) {
      console.error("Error fetching pending restaurants:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Approve/reject restaurant
router.patch(
  "/restaurants/:id/approval",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { isApproved } = req.body;

      const restaurant = await User.findOneAndUpdate(
        { _id: req.params.id, role: "restaurant" },
        { isApproved },
        { new: true }
      ).select("-password");

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      res.json({
        message: `Restaurant ${
          isApproved ? "approved" : "rejected"
        } successfully`,
        restaurant,
      });
    } catch (error) {
      console.error("Error updating restaurant approval:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update restaurant promotions
router.patch(
  "/restaurants/promotions",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { promotedRestaurants } = req.body; // Array of restaurant IDs to promote

      // First, remove promotion from all restaurants
      await User.updateMany({ role: "restaurant" }, { isPromoted: false });

      // Then, promote selected restaurants
      if (promotedRestaurants && promotedRestaurants.length > 0) {
        await User.updateMany(
          { _id: { $in: promotedRestaurants }, role: "restaurant" },
          { isPromoted: true }
        );
      }

      res.json({
        message: "Restaurant promotions updated successfully",
      });
    } catch (error) {
      console.error("Error updating restaurant promotions:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all users
router.get("/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders
router.get("/orders", authenticate, authorize("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("restaurant", "name")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
