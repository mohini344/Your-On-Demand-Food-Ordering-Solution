import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Star, Clock, Truck } from "lucide-react";
import { restaurantsAPI } from "../lib/api";

const Home = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const foodCategories = [
    {
      name: "Breakfast",
      image:
        "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
      category: "breakfast",
    },
    {
      name: "Biryani",
      image:
        "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
      category: "indian",
    },
    {
      name: "Pizza",
      image:
        "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
      category: "pizza",
    },
    {
      name: "Noodles",
      image:
        "https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
      category: "chinese",
    },
    {
      name: "Burger",
      image:
        "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
      category: "burger",
    },
  ];

  useEffect(() => {
    fetchFeaturedRestaurants();
  }, []);

  const fetchFeaturedRestaurants = async () => {
    try {
      setLoading(true);
      // Fetch promoted restaurants first, fallback to all restaurants
      const response = await restaurantsAPI.getPromoted();
      setFeaturedRestaurants(response.data.slice(0, 4)); // Show only first 4 restaurants
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      // Fallback to regular restaurants if promoted endpoint fails
      try {
        const fallbackResponse = await restaurantsAPI.getAll();
        setFeaturedRestaurants(fallbackResponse.data.slice(0, 4));
      } catch (fallbackError) {
        console.error("Error fetching fallback restaurants:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantImage = (restaurant) => {
    // Map cuisine types to appropriate images
    const imageMap = {
      indian:
        "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      "fast food":
        "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      italian:
        "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      chinese:
        "https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      "multi-cuisine":
        "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      mexican:
        "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      dessert:
        "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    };

    return (
      imageMap[restaurant.cuisineType?.toLowerCase()] ||
      "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Food Categories */}
        <div className="mb-12">
          <div className="flex justify-center space-x-8 md:space-x-12">
            {foodCategories.map((category, index) => (
              <Link
                key={index}
                to={`/restaurants?category=${category.category}`}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-500 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Restaurants Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Popular Restaurants
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-40 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No restaurants available
              </h3>
              <p className="text-gray-600">
                Check back later for new restaurants
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <Link
                  key={restaurant._id}
                  to={`/restaurant/${restaurant._id}`}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group relative"
                >
                  {restaurant.isPromoted && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                      Featured
                    </div>
                  )}
                  <div className="h-40 relative overflow-hidden">
                    <img
                      src={getRestaurantImage(restaurant)}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-lg drop-shadow-lg">
                        {restaurant.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-1">
                      {restaurant.cuisineType}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {restaurant.address}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
