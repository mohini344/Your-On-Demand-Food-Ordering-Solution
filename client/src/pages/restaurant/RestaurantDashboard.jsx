import React, { useState, useEffect } from "react";
import {
  Plus,
  Package,
  ShoppingBag,
  TrendingUp,
  Edit,
  Trash2,
  Home,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { productsAPI, ordersAPI, restaurantsAPI } from "../../lib/api";
import toast from "react-hot-toast";

const RestaurantDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isApproved) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsResponse, ordersResponse, statsResponse] =
        await Promise.all([
          productsAPI.getAll({ restaurant: user._id }),
          ordersAPI.getRestaurantOrders(),
          restaurantsAPI.getDashboardStats(),
        ]);

      setProducts(productsResponse.data);
      setOrders(ordersResponse.data);
      setStats({
        totalProducts: productsResponse.data.length,
        totalOrders: ordersResponse.data.length,
        totalRevenue: ordersResponse.data.reduce(
          (sum, order) => sum + order.totalPrice,
          0
        ),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productsAPI.delete(productId);
      toast.success("Product deleted successfully");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.create({
        ...newProduct,
        price: parseFloat(newProduct.price),
      });
      toast.success("Product added successfully");
      setShowAddProduct(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      toast.success("Order status updated successfully");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getProductImage = (product) => {
    if (product.imageUrl) return product.imageUrl;

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

  const renderNavigation = () => (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">SB Foods (Restaurant)</h1>
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
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-1 rounded ${
            activeTab === "orders" ? "bg-gray-600" : "hover:bg-gray-700"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`px-3 py-1 rounded ${
            activeTab === "menu" ? "bg-gray-600" : "hover:bg-gray-700"
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setShowAddProduct(true)}
          className={`px-3 py-1 rounded ${
            showAddProduct ? "bg-gray-600" : "hover:bg-gray-700"
          }`}
        >
          New Item
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">All Items</h3>
            <p className="text-3xl font-bold mb-4">
              {loading ? "..." : stats.totalProducts}
            </p>
            <button
              onClick={() => setActiveTab("menu")}
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

        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Add Item</h3>
            <p className="text-sm text-gray-400 mb-4">(new)</p>
            <button
              onClick={() => setShowAddProduct(true)}
              className="border border-orange-500 text-orange-500 px-4 py-1 rounded hover:bg-orange-500 hover:text-white transition-colors"
            >
              Add now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddProduct = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 text-white">
        <h2 className="text-2xl font-bold text-center mb-6">New Product</h2>

        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Product Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <input
              type="url"
              placeholder="Thumbnail img url"
              value={newProduct.imageUrl}
              onChange={(e) =>
                setNewProduct({ ...newProduct, imageUrl: e.target.value })
              }
              className="w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Category
              </label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Choose Product cat</option>
                <option value="pizza">Pizza</option>
                <option value="burger">Burger</option>
                <option value="chinese">Chinese</option>
                <option value="indian">Indian</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="dessert">Dessert</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price</label>
              <input
                type="number"
                placeholder="0"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition-colors"
            >
              Add product
            </button>
            <button
              type="button"
              onClick={() => setShowAddProduct(false)}
              className="flex-1 bg-gray-600 text-white py-3 rounded font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!user?.isApproved && user?.role === "restaurant") {
    return (
      <div className="min-h-screen bg-gray-600 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pending Approval
          </h2>
          <p className="text-gray-600">
            Your restaurant account is pending admin approval. You'll receive
            access to your dashboard once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-600">
      {renderNavigation()}
      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "orders" && (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Orders</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-white mb-2">
                No orders yet
              </h3>
              <p className="text-gray-400">
                Orders will appear here once customers start ordering
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-800 rounded-lg p-6 text-white"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Customer: {order.customer.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Phone: {order.customer.phone}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Items:</p>
                        {order.items.map((item, index) => (
                          <p key={index} className="text-sm text-gray-300">
                            {item.product.name} x {item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ₹{order.totalPrice.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-600"
                            : order.status === "preparing"
                            ? "bg-yellow-600"
                            : order.status === "confirmed"
                            ? "bg-blue-600"
                            : "bg-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                      <div className="mt-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order._id, e.target.value)
                          }
                          className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === "menu" && (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Menu Items</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg p-4 animate-pulse"
                >
                  <div className="h-32 bg-gray-700 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-800 rounded-lg p-4 text-white"
                >
                  <div className="h-32 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-orange-500 font-bold mb-3">
                    ₹{product.price.toFixed(2)}
                  </p>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showAddProduct && renderAddProduct()}
    </div>
  );
};

export default RestaurantDashboard;
