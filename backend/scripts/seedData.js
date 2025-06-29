import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for seeding...");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({ role: { $in: ["restaurant", "admin"] } });
    await Product.deleteMany({});

    console.log("Cleared existing data...");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      name: "Admin User",
      email: "admin@sbfoods.com",
      password: adminPassword,
      phone: "9999999999",
      address: "Admin Office, Hyderabad",
      role: "admin",
      isApproved: true,
    });
    await admin.save();
    console.log("Admin user created");

    // Create sample restaurants
    const restaurants = [
      {
        name: "Andhra Spice",
        email: "andhra@spice.com",
        password: await bcrypt.hash("restaurant123", 10),
        phone: "9876543210",
        address: "Madhapur, Hyderabad",
        role: "restaurant",
        cuisineType: "Indian",
        description:
          "Authentic Andhra cuisine with traditional spices and flavors",
        isApproved: true,
      },
      {
        name: "Mc donalds",
        email: "mcdonalds@food.com",
        password: await bcrypt.hash("restaurant123", 10),
        phone: "9876543211",
        address: "Manikonda, Hyderabad",
        role: "restaurant",
        cuisineType: "Fast Food",
        description: "World famous burgers, fries and fast food",
        isApproved: true,
      },
      {
        name: "Paradise Grand",
        email: "paradise@grand.com",
        password: await bcrypt.hash("restaurant123", 10),
        phone: "9876543212",
        address: "Hitech city, Hyderabad",
        role: "restaurant",
        cuisineType: "Indian",
        description: "Famous for biryani and traditional Indian dishes",
        isApproved: true,
      },
      {
        name: "Minarva Grand",
        email: "minarva@grand.com",
        password: await bcrypt.hash("restaurant123", 10),
        phone: "9876543213",
        address: "Kokurpally, Hyderabad",
        role: "restaurant",
        cuisineType: "Multi-cuisine",
        description: "Multi-cuisine restaurant with diverse menu options",
        isApproved: true,
      },
      {
        name: "Pizza Palace",
        email: "pizza@palace.com",
        password: await bcrypt.hash("restaurant123", 10),
        phone: "9876543214",
        address: "Gachibowli, Hyderabad",
        role: "restaurant",
        cuisineType: "Italian",
        description: "Authentic Italian pizzas with fresh ingredients",
        isApproved: true,
      },
    ];

    const savedRestaurants = [];
    for (const restaurantData of restaurants) {
      const restaurant = new User(restaurantData);
      await restaurant.save();
      savedRestaurants.push(restaurant);
    }
    console.log("Sample restaurants created");

    // Create sample products for each restaurant
    const products = [
      // Andhra Spice products
      {
        name: "Chicken Biryani",
        description:
          "Aromatic basmati rice cooked with tender chicken pieces and traditional Andhra spices",
        price: 262,
        category: "indian",
        imageUrl:
          "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[0]._id,
        rating: 4.5,
        reviewCount: 120,
      },
      {
        name: "Butter Chicken",
        description:
          "Creamy tomato-based curry with tender chicken pieces and aromatic spices",
        price: 229,
        category: "indian",
        imageUrl:
          "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[0]._id,
        rating: 4.3,
        reviewCount: 85,
      },
      {
        name: "Paneer Tikka",
        description:
          "Grilled cottage cheese marinated in spices and yogurt, served with mint chutney",
        price: 189,
        category: "indian",
        imageUrl:
          "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[0]._id,
        rating: 4.2,
        reviewCount: 65,
      },
      {
        name: "Vanilla Lassi",
        description:
          "Refreshing yogurt-based drink with vanilla flavor and a hint of cardamom",
        price: 119,
        category: "beverages",
        imageUrl:
          "https://images.pexels.com/photos/1793037/pexels-photo-1793037.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[0]._id,
        rating: 4.0,
        reviewCount: 45,
      },

      // Mc donalds products
      {
        name: "Mc Maharaj",
        description:
          "Big size burger with chicken patty, lettuce, tomato and special sauce",
        price: 175,
        category: "burger",
        imageUrl:
          "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[1]._id,
        rating: 4.4,
        reviewCount: 200,
      },
      {
        name: "French Fries",
        description:
          "Long French fries made from premium potatoes, crispy and golden",
        price: 134,
        category: "burger",
        imageUrl:
          "https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[1]._id,
        rating: 4.1,
        reviewCount: 150,
      },
      {
        name: "Cold Coffee",
        description:
          "Tender coffee made from premium coffee beans with ice and milk",
        price: 201,
        category: "beverages",
        imageUrl:
          "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[1]._id,
        rating: 4.2,
        reviewCount: 80,
      },
      {
        name: "Chicken Burger",
        description:
          "Juicy chicken burger with fresh vegetables and special sauce",
        price: 189,
        category: "burger",
        imageUrl:
          "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[1]._id,
        rating: 4.3,
        reviewCount: 95,
      },

      // Paradise Grand products
      {
        name: "Hyderabadi Biryani",
        description:
          "Traditional Hyderabadi biryani with tender mutton and aromatic basmati rice",
        price: 349,
        category: "indian",
        imageUrl:
          "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[2]._id,
        rating: 4.7,
        reviewCount: 300,
      },
      {
        name: "Chicken Tikka",
        description: "Grilled chicken pieces marinated in yogurt and spices",
        price: 219,
        category: "indian",
        imageUrl:
          "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[2]._id,
        rating: 4.4,
        reviewCount: 180,
      },
      {
        name: "Masala Chai",
        description: "Traditional Indian tea with aromatic spices and milk",
        price: 45,
        category: "beverages",
        imageUrl:
          "https://images.pexels.com/photos/1793037/pexels-photo-1793037.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[2]._id,
        rating: 4.0,
        reviewCount: 120,
      },

      // Minarva Grand products
      {
        name: "Tandoori Chicken",
        description:
          "Chicken marinated in yogurt and spices, cooked in a tandoor oven",
        price: 491,
        category: "indian",
        imageUrl:
          "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[3]._id,
        rating: 4.6,
        reviewCount: 220,
      },
      {
        name: "Chicken Fried Rice",
        description: "Wok-fried rice with chicken, vegetables and soy sauce",
        price: 189,
        category: "chinese",
        imageUrl:
          "https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[3]._id,
        rating: 4.2,
        reviewCount: 140,
      },
      {
        name: "Veg Manchurian",
        description: "Deep-fried vegetable balls in a tangy Indo-Chinese sauce",
        price: 159,
        category: "chinese",
        imageUrl:
          "https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[3]._id,
        rating: 4.1,
        reviewCount: 90,
      },

      // Pizza Palace products
      {
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella, tomatoes and basil",
        price: 249,
        category: "pizza",
        imageUrl:
          "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[4]._id,
        rating: 4.3,
        reviewCount: 160,
      },
      {
        name: "Chicken Supreme Pizza",
        description:
          "Loaded pizza with chicken, bell peppers, onions and cheese",
        price: 349,
        category: "pizza",
        imageUrl:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[4]._id,
        rating: 4.5,
        reviewCount: 190,
      },
      {
        name: "Garlic Bread",
        description: "Crispy bread with garlic butter and herbs",
        price: 129,
        category: "italian",
        imageUrl:
          "https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[4]._id,
        rating: 4.0,
        reviewCount: 75,
      },
      {
        name: "Tiramisu",
        description:
          "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
        price: 189,
        category: "dessert",
        imageUrl:
          "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        restaurant: savedRestaurants[4]._id,
        rating: 4.4,
        reviewCount: 85,
      },
    ];

    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
    }
    console.log("Sample products created");

    // Create a sample customer
    const customerPassword = await bcrypt.hash("customer123", 10);
    const customer = new User({
      name: "John Doe",
      email: "customer@example.com",
      password: customerPassword,
      phone: "9876543220",
      address: "Kondapur, Hyderabad",
      role: "customer",
      isApproved: true,
    });
    await customer.save();
    console.log("Sample customer created");

    console.log("\n=== SAMPLE DATA CREATED SUCCESSFULLY ===");
    console.log("\nLogin Credentials:");
    console.log("Admin: admin@sbfoods.com / admin123");
    console.log("Customer: customer@example.com / customer123");
    console.log("\nRestaurant Accounts:");
    console.log("Andhra Spice: andhra@spice.com / restaurant123");
    console.log("Mc donalds: mcdonalds@food.com / restaurant123");
    console.log("Paradise Grand: paradise@grand.com / restaurant123");
    console.log("Minarva Grand: minarva@grand.com / restaurant123");
    console.log("Pizza Palace: pizza@palace.com / restaurant123");
    console.log("\nTotal Restaurants: 5");
    console.log("Total Products: 18");
    console.log("===========================================\n");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();
