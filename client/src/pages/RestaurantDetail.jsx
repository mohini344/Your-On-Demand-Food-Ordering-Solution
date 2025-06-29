import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Clock, MapPin, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { restaurantsAPI, productsAPI } from "../lib/api";
import toast from "react-hot-toast";

const RestaurantDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({
    sortBy: "popularity",
    foodType: "all",
    categories: [],
  });

  const categories = [
    "biryani",
    "burger",
    "pizza",
    "curry",
    "sides",
    "beverages",
    "chinese",
    "indian",
    "italian",
    "mexican",
    "dessert",
  ];

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const response = await restaurantsAPI.getById(id);
      setRestaurant(response.data.restaurant);
      setMenuItems(response.data.products || []);
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      toast.error("Failed to load restaurant data");
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (product.imageUrl) return product.imageUrl;

    // Map categories to appropriate images
    const imageMap = {
      burger:
        "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      pizza:
        "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      chinese:
        "https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      indian:
        "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      italian:
        "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      mexican:
        "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      dessert:
        "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      beverages:
        "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    };

    return (
      imageMap[product.category] ||
      "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop"
    );
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "categories") {
      setSelectedFilters((prev) => ({
        ...prev,
        categories: prev.categories.includes(value)
          ? prev.categories.filter((cat) => cat !== value)
          : [...prev.categories, value],
      }));
    } else {
      setSelectedFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));
    }
  };

  const filteredItems = menuItems
    .filter((item) => {
      // Category filter
      if (
        selectedFilters.categories.length > 0 &&
        !selectedFilters.categories.includes(item.category)
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (selectedFilters.sortBy) {
        case "low-price":
          return a.price - b.price;
        case "high-price":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default: // popularity
          return (b.rating || 0) - (a.rating || 0);
      }
    });

  const handleAddToCart = (item) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customers can add items to cart");
      return;
    }
    addToCart(item);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 animate-pulse">
            <div className="text-center">
              <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurant not found
          </h2>
          <p className="text-gray-600 mb-4">
            The restaurant you're looking for doesn't exist.
          </p>
          <Link to="/restaurants" className="text-blue-500 hover:text-blue-600">
            Browse all restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {restaurant.name}
            </h1>
            <p className="text-gray-600 mb-4">{restaurant.address}</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>4.2</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>25-30 min</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{restaurant.cuisineType}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

              {/* Sort By */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { value: "popularity", label: "Popularity" },
                    { value: "low-price", label: "Low-price" },
                    { value: "high-price", label: "High-price" },
                    { value: "rating", label: "Rating" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={selectedFilters.sortBy === option.value}
                        onChange={(e) =>
                          handleFilterChange("sortBy", e.target.value)
                        }
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.categories.includes(category)}
                        onChange={() =>
                          handleFilterChange("categories", category)
                        }
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-gray-700 capitalize">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                All Items
              </h2>
              <p className="text-gray-600">
                {filteredItems.length} items available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹ {item.price}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{Math.round(item.price * 1.2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {item.rating || 4.2}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No items found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more items
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
