import React, { useState, useEffect } from "react";
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
  XCircle,
  Home,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../lib/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [promotedRestaurants, setPromotedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsResponse,
        pendingResponse,
        ordersResponse,
        restaurantsResponse,
      ] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingRestaurants(),
        adminAPI.getOrders(),
        adminAPI.getUsers(),
      ]);

      setStats(statsResponse.data);
      setPendingRestaurants(pendingResponse.data);
      setAllOrders(ordersResponse.data);

      const restaurants = restaurantsResponse.data.filter(
        (user) => user.role === "restaurant"
      );
      setAllRestaurants(restaurants);

      // Set currently promoted restaurants
      const promoted = restaurants
        .filter((restaurant) => restaurant.isPromoted)
        .map((r) => r._id);
      setPromotedRestaurants(promoted);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantApproval = async (restaurantId, approved) => {
    try {
      await adminAPI.approveRestaurant(restaurantId, approved);
      toast.success(
        `Restaurant ${approved ? "approved" : "rejected"} successfully`
      );
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error updating restaurant approval:", error);
      toast.error("Failed to update restaurant approval");
    }
  };

  const handlePromotionChange = (restaurantId, isPromoted) => {
    if (isPromoted) {
      setPromotedRestaurants((prev) => [...prev, restaurantId]);
    } else {
      setPromotedRestaurants((prev) =>
        prev.filter((id) => id !== restaurantId)
      );
    }
  };

  const handleUpdatePromotions = async () => {
    try {
      await adminAPI.updatePromotions(promotedRestaurants);
      toast.success("Restaurant promotions updated successfully");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error updating promotions:", error);
      toast.error("Failed to update promotions");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getRestaurantImage = (restaurant) => {
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

  const renderNavigation = () => (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">SB Foods (admin)</h1>
      <div className="flex items-center space-x-6">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-3 py-1 rounded ${
            activeTab === "dashboard" ? "bg-gray-600" : "hover:bg-gray-700"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-3 py-1 rounded ${
            activeTab === "users" ? "bg-gray-600" : "hover:bg-gray-700"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-1 rounded ${
            activeTab === "orders" ? "bg-gray-600" : "hover:bg-gray-700"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("restaurants")}
          className={`px-3 py-1 rounded ${
            activeTab === "restaurants" ? "bg-gray-600" : "hover:bg-gray-700"
          }`}
        >
          Restaurants
        </button>
        <button
          onClick={handleSignOut}
          className="px-3 py-1 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );

  const renderDashboard = () => (
    <div className="p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Total users</h3>
            <p className="text-3xl font-bold mb-4">
              {loading ? "..." : stats.totalUsers}
            </p>
            <button
              onClick={() => setActiveTab("users")}
              className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-500 hover:text-white transition-colors"
            >
              View all
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">All Restaurants</h3>
            <p className="text-3xl font-bold mb-4">
              {loading ? "..." : stats.totalRestaurants}
            </p>
            <button
              onClick={() => setActiveTab("restaurants")}
              className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-500 hover:text-white transition-colors"
            >
              View all
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">All Orders</h3>
            <p className="text-3xl font-bold mb-4">
              {loading ? "..." : stats.totalOrders}
            </p>
            <button
              onClick={() => setActiveTab("orders")}
              className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-500 hover:text-white transition-colors"
            >
              View all
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Restaurants */}
        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-4">
            Popular Restaurants (promotions)
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {allRestaurants.map((restaurant) => (
              <div key={restaurant._id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={promotedRestaurants.includes(restaurant._id)}
                  onChange={(e) =>
                    handlePromotionChange(restaurant._id, e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm flex-1">{restaurant.name}</span>
                <span className="text-xs text-gray-400">
                  {restaurant.cuisineType}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpdatePromotions}
            className="mt-4 border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-500 hover:text-white transition-colors"
          >
            Update
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Selected restaurants will appear as "Featured" on the homepage
          </p>
        </div>

        {/* Approvals */}
        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-4">Approvals</h3>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : pendingRestaurants.length === 0 ? (
            <p className="text-gray-400">No new requests...</p>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {pendingRestaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="border border-gray-600 rounded p-3"
                >
                  <h4 className="font-medium">{restaurant.name}</h4>
                  <p className="text-sm text-gray-400">{restaurant.email}</p>
                  <p className="text-sm text-gray-400">
                    {restaurant.cuisineType}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() =>
                        handleRestaurantApproval(restaurant._id, true)
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleRestaurantApproval(restaurant._id, false)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Orders</h2>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      ) : allOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
          <p className="text-gray-400">
            Orders will appear here once customers start ordering
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allOrders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-800 rounded-lg p-6 text-white"
            >
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    {order.items[0]?.product?.name || "Order Item"}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    {order.restaurant?.name}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">UserID:</span>
                      <p>{order.customer?._id?.slice(-8)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <p>{order.customer?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Mobile:</span>
                      <p>{order.customer?.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p>{order.customer?.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Quantity:</span>
                      <p>
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Price:</span>
                      <p>₹ {order.totalPrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Payment mode:</span>
                      <p>{order.paymentMethod}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Address:</span>
                      <p>{order.deliveryAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Ordered on:</span>
                      <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Time:</span>
                      <p>{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p>{order.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRestaurants = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">All restaurants</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allRestaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden relative"
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
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg drop-shadow-lg">
                    {restaurant.name}
                  </h3>
                </div>
              </div>
              <div className="p-4 text-center">
                <p className="text-gray-600 text-sm">{restaurant.address}</p>
                <p className="text-gray-500 text-xs">
                  {restaurant.cuisineType}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-600">
      {renderNavigation()}
      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "orders" && renderOrders()}
      {activeTab === "restaurants" && renderRestaurants()}
      {activeTab === "users" && renderDashboard()}
    </div>
  );
};

export default AdminDashboard;
