import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get all approved restaurants
router.get("/", async (req, res) => {
  try {
    const { search, cuisine } = req.query;
    let query = { role: "restaurant", isApproved: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { cuisineType: { $regex: search, $options: "i" } },
      ];
    }

    if (cuisine && cuisine !== "all") {
      query.cuisineType = { $regex: cuisine, $options: "i" };
    }

    const restaurants = await User.find(query)
      .select("-password -cart")
      .sort({ isPromoted: -1, createdAt: -1 }); // Sort promoted restaurants first

    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get promoted restaurants for homepage
router.get("/promoted", async (req, res) => {
  try {
    const promotedRestaurants = await User.find({
      role: "restaurant",
      isApproved: true,
      isPromoted: true,
    })
      .select("-password -cart")
      .sort({ createdAt: -1 });

    // If no promoted restaurants, return top 4 restaurants
    if (promotedRestaurants.length === 0) {
      const topRestaurants = await User.find({
        role: "restaurant",
        isApproved: true,
      })
        .select("-password -cart")
        .sort({ createdAt: -1 })
        .limit(4);

      return res.json(topRestaurants);
    }

    res.json(promotedRestaurants);
  } catch (error) {
    console.error("Error fetching promoted restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single restaurant with products
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await User.findOne({
      _id: req.params.id,
      role: "restaurant",
      isApproved: true,
    }).select("-password -cart");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const products = await Product.find({
      restaurant: restaurant._id,
      isAvailable: true,
    }).sort({ createdAt: -1 });

    res.json({
      restaurant,
      products,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get restaurant dashboard data
router.get(
  "/dashboard/stats",
  authenticate,
  authorize("restaurant"),
  async (req, res) => {
    try {
      const restaurantId = req.user._id;

      // Get products count
      const productsCount = await Product.countDocuments({
        restaurant: restaurantId,
      });

      // Get orders count and revenue (you'll need to implement Order model)
      // For now, returning mock data
      const ordersCount = 0;
      const totalRevenue = 0;

      res.json({
        productsCount,
        ordersCount,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching restaurant stats:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
