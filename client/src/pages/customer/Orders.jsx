import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ShoppingBag, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../../lib/api";
import toast from "react-hot-toast";

const Orders = () => {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getOrderImage = (order) => {
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

    // Try to get image based on first item's category or use default
    const firstItem = order.items?.[0];
    if (firstItem?.product?.category) {
      return (
        imageMap[firstItem.product.category] ||
        "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop"
      );
    }

    return "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop";
  };

  const renderNavigation = () => (
    <nav className="bg-white shadow-sm border-b border-gray-100 p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">SB Foods</h1>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <span className="text-gray-700 font-medium">{user?.name}</span>
        </div>
        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">{orders.length}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-gray-600 hover:text-gray-800"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}

      <div className="max-w-4xl mx-auto p-6">
        {/* Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Username:</span> {user?.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="font-medium">Orders:</span> {orders.length}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full mt-4 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>

            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-3 bg-gray-300 rounded"></div>
                          <div className="h-3 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600">
                  Your order history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg shadow-sm p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={getOrderImage(order)}
                          alt="Order"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {order.items[0]?.product?.name || "Order Item"}
                          {order.items.length > 1 &&
                            ` +${order.items.length - 1} more`}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {order.restaurant?.name}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Order #:</span>
                            <p className="font-medium">{order.orderNumber}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <p className="font-medium">
                              {order.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Price:</span>
                            <p className="font-medium">₹ {order.totalPrice}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Payment mode:</span>
                            <p className="font-medium">{order.paymentMethod}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Ordered on:</span>
                            <p className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <p className="font-medium">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <p
                              className={`font-medium ${
                                order.status === "delivered"
                                  ? "text-green-600"
                                  : order.status === "preparing"
                                  ? "text-yellow-600"
                                  : order.status === "confirmed"
                                  ? "text-blue-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {order.status}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Address:</span>
                            <p className="font-medium text-xs">
                              {order.deliveryAddress}
                            </p>
                          </div>
                        </div>

                        {(order.status === "pending" ||
                          order.status === "confirmed") && (
                          <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
