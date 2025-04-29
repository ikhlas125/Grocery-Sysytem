import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showCashConfirmation, setShowCashConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedOrder(null);
      setOrderDetails([]);
      setIsClosing(false);
    }, 200);
  };
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }

    setUser(userData);
    fetchProducts();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === "orders") {
      loadOrders();
    }
  }, [user, activeTab]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/categories"
        );
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (activeTab === "home") {
      fetchCategories();
    }
  }, [activeTab]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const fetchProducts = async (category = null) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = "http://localhost:5000/api/products";
      let options = { method: "GET" };

      if (category) {
        url = "http://localhost:5000/api/products/filter-category";
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category_name: category }),
        };
      }

      const response = await fetch(url, options);

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error("Invalid data format from server");
      }

      setProducts(result.data);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          customerId: user?.customerId, // CHANGED from user?.name
          action: "get",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCartItems(data.data);
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Use localStorage directly
          },
          body: JSON.stringify({
            customerid: user.customerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      return data.data; // Return the orders array
    } catch (error) {
      console.error("Order fetch error:", error);
      // Consider adding error state handling here
      throw error; // Re-throw to handle in component
    }
  };

  const loadOrders = async () => {
    try {
      const orders = await fetchOrders();
      setOrders(orders); // Update state with fetched orders
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const response = await fetch("http://localhost:5000/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          customerId: user?.customerId, // CHANGED from customerName
          productName: product.product_name,
          quantity: 1,
          action: "add",
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchCartItems();
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      const product = products.find((p) => p.product_id === productId);
      const response = await fetch("http://localhost:5000/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          customerId: user?.customerId, // CHANGED from customerName
          productName: product.product_name,
          quantity: newQuantity,
          action: "update",
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchCartItems();
      }
    } catch (error) {
      console.error("Quantity change error:", error);
    }
  };

  const handleQuantityChanges = async (productId, newQuantity) => {
    try {
      const product = products.find((p) => p.product_id === productId);
      const response = await fetch("http://localhost:5000/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          customerId: user?.customerId, // CHANGED from customerName
          productName: product.product_name,
          quantity: newQuantity,
          action: "decrease",
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchCartItems();
      }
    } catch (error) {
      console.error("Quantity change error:", error);
    }
  };

  const removeItem = async (productId, quantity = 1) => {
    try {
      const product = products.find((p) => p.product_id === productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const response = await fetch("http://localhost:5000/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          customerId: user?.customerId, // CHANGED from customerName
          productName: product.product_name,
          quantity: quantity,
          action: "remove",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Optimistically update UI before fetching
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.product_id !== productId)
        );
        await fetchCartItems(); // Then sync with server
      }
    } catch (error) {
      console.error("Remove item error:", error);
      setError(error.message);
      // Revert optimistic update if needed
      fetchCartItems();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setShowPaymentOptions(true);
  };

  const handleOrderClick = async (orderId) => {
    try {
      setIsLoadingDetails(true);
      setErrorDetails(null);
      const details = await fetchOrderDetails(orderId);
      setSelectedOrder(orderId);
      setOrderDetails(details);
    } catch (error) {
      setErrorDetails(error.message);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // In UserDashboard component
  const handlePaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentOptions(false);

    const cartTotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    if (method === "card") {
      navigate("/CardPaymentForm", {
        state: {
          totalAmount: cartTotal, // This is now passed via state
          cartItems: cartItems,
        },
      });
    } else if (method === "cash") {
      alert("Order will be processed as cash on delivery!");
    }
  };

  const handleCashCheckout = async () => {
    try {
      setShowPaymentOptions(false);
      const response = await fetch(
        "http://localhost:5000/api/products/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            customerid: user.customerId,
            payment: "cash",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cash checkout failed");
      }

      if (data.success) {
        setCartItems([]);
        setShowCashConfirmation(true);
        loadOrders();
      }
    } catch (error) {
      console.error("Cash checkout error:", error);
      setErrorDetails(error.message);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/order-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ orderid: orderId }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch order details");

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Order details fetch error:", error);
      throw error;
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this order?"
      );
      if (!confirmCancel) return;

      const response = await fetch(
        "http://localhost:5000/api/products/cancel-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            order_id: orderId,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to cancel order");

      if (data.success) {
        // Refresh orders list
        alert(data.message || "Order cancelled successfully");
        loadOrders();
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      alert(error.message || "Failed to cancel order");
      setErrorDetails(error.message);
    }
  };

  const handleRemoveProductFromOrder = async (orderDetailId, productId) => {
    try {
      const confirmRemove = window.confirm(
        "Are you sure you want to remove this item from your order?"
      );
      if (!confirmRemove) return;

      const response = await fetch(
        "http://localhost:5000/api/products/cancel-Item",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            order_detail_id: orderDetailId,
            product_id: productId,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to remove item");

      if (data.success) {
        // Refresh order details and orders list
        alert(data.message);
        const updatedDetails = await fetchOrderDetails(selectedOrder);
        setOrderDetails(updatedDetails);
        loadOrders();
      }
    } catch (error) {
      console.error("Remove item error:", error);
      alert(error.message || "Failed to remove item");
      setErrorDetails(error.message);
    }
  };

  const renderCashConfirmation = () => (
    <div className="modal-overlay">
      <div className="confirmation-card">
        <div className="confirmation-content">
          <h3>🎉 Order Successful!</h3>
          <p>Your order has been placed successfully with Cash on Delivery.</p>
          <p>Order ID: {orders[orders.length - 1]?.order_id}</p>
          <button
            className="confirm-ok-btn"
            onClick={() => {
              setShowCashConfirmation(false);
              setActiveTab("orders");
            }}
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );

  const renderCart = () => {
    const cartTotal = cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);

    return (
      <div className="cart-content">
        <h2>Shopping Cart ({cartItems.length})</h2>
        {cartItems.length === 0 ? (
          <p className="no-products">Your cart is empty</p>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <img
                    src={item.image_url || "/placeholder-product.jpg"}
                    alt={item.product_name}
                    onError={(e) => {
                      e.target.src = "/placeholder-product.jpg";
                    }}
                  />
                  <div className="item-details">
                    <h3>{item.product_name}</h3>
                    <p>Price: ${item.price?.toFixed(2) || "0.00"}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleQuantityChanges(
                            item.product_id,
                            item.quantity - 1
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.product_id,
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product_id,
                            item.quantity + 1
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      className="remove-item"
                      onClick={() => removeItem(item.product_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h3>Cart Total: ${cartTotal}</h3>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              {showPaymentOptions && (
                <div className="payment-modal-overlay">
                  <div className="payment-modal">
                    <h3>Select Payment Method</h3>
                    <button
                      className="payment-method-btn card"
                      onClick={() => handlePaymentMethod("card")}
                    >
                      Credit/Debit Card
                    </button>
                    <button
                      className="payment-method-btn cash"
                      onClick={handleCashCheckout}
                    >
                      Cash on Delivery
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setShowPaymentOptions(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderProducts = (query = "") => {
    // Filter products based on search query
    const filteredProducts = products.filter(
      (product) =>
        product.product_name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );

    if (isLoading) {
      return (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-message">⚠️ Error loading products: {error}</div>
      );
    }

    if (filteredProducts.length === 0) {
      return query ? (
        <p className="no-products">No products match your search</p>
      ) : (
        <p className="no-products">No products available at the moment</p>
      );
    }

    return (
      <div className="products-list">
        {filteredProducts.map((product) => (
          <div key={product.product_id} className="product-card">
            <img
              src={product.image_url || "/placeholder-product.jpg"}
              alt={product.product_name}
              onError={(e) => {
                e.target.src = "/placeholder-product.jpg";
              }}
            />
            <h3>{product.product_name}</h3>
            <br />
            <p className="product-description">
              {product.description || "No description available"}
            </p>
            <p className="price">${product.price?.toFixed(2) || "0.00"}</p>
            <button
              className="add-to-cart"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className={`dashboard-sidebar ${!isSidebarOpen ? "collapsed" : ""}`}>
        <div className="user-profile">
          <div className="profile-picture">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <h3>{user?.name || "User"}</h3>
          <p>{user?.email || ""}</p>
          <button
            className="edit-profile-btn"
            onClick={() => setActiveTab("profile")}
          >
            Edit Profile
          </button>
        </div>

        <nav className="dashboard-nav">
          <button
            className={activeTab === "home" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            🏠 Home
          </button>
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            📦 My Orders
          </button>
          <button
            className={activeTab === "cart" ? "active" : ""}
            onClick={() => setActiveTab("cart")}
          >
            🛒 Cart
          </button>
        </nav>
      </div>

      <div className={`dashboard-main ${!isSidebarOpen ? "collapsed" : ""}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <div className={`hamburger ${isSidebarOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {activeTab === "home" && (
          <div className="products-grid">
            <div className="products-header">
              <h2>Available Products ({products.length})</h2>
              <div className="filters-container">
                <div className="category-filter">
                  <select
                    value={selectedCategory}
                    onChange={async (e) => {
                      const category = e.target.value;
                      setSelectedCategory(category);
                      await fetchProducts(category);
                    }}
                    className="category-select"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_name}
                      >
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                </div>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
              </div>
            </div>
            {renderProducts(searchQuery)}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-settings">
            <h2>Profile Settings</h2>
            <form>
              <label>
                Name:
                <input
                  type="text"
                  defaultValue={user?.name || ""}
                  placeholder="Enter your name"
                />
              </label>
              <label>
                Email:
                <input type="email" defaultValue={user?.email || ""} disabled />
              </label>
              <button type="submit">Update Profile</button>
            </form>
          </div>
        )}
        {activeTab === "cart" && renderCart()}
        {activeTab === "orders" && (
          <div className="orders-grid">
            <h2>Order History ({orders.length})</h2>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className={`modal-overlay ${isClosing ? "closing" : ""}`}>
                <div
                  className={`order-details-modal ${
                    isClosing ? "closing" : ""
                  }`}
                >
                  <button className="close-button" onClick={closeModal}>
                    &times;
                  </button>
                  <h3>Order #{selectedOrder} Details</h3>

                  {isLoadingDetails ? (
                    <div className="loading-indicator">
                      <div className="spinner"></div>
                      <p>Loading order details...</p>
                    </div>
                  ) : errorDetails ? (
                    <div className="error-message">
                      ⚠️ Error loading details: {errorDetails}
                    </div>
                  ) : (
                    <div className="order-products">
                      {orderDetails.map((item, index) => (
                        <div key={index} className="order-product-item">
                          <img
                            src={item.image_url || "/placeholder-product.jpg"}
                            alt={item.product_name}
                            onError={(e) => {
                              e.target.src = "/placeholder-product.jpg";
                            }}
                          />
                          <div className="product-info">
                            <h4>{item.product_name}</h4>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: ${item.unit_price?.toFixed(2)} each</p>
                            <p>
                              Total: $
                              {(item.unit_price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          {/* Add cancel button here */}
                          {orders
                            .find((o) => o.order_id === selectedOrder)
                            ?.order_status?.toLowerCase() === "pending" && (
                            <button
                              className="remove-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProductFromOrder(
                                  item.order_detail_id,
                                  item.product_id
                                );
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders List */}
            {isLoading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading orders...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                ⚠️ Error loading orders: {error}
              </div>
            ) : orders.length === 0 ? (
              <p className="no-orders">No orders found</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div
                    key={order.order_id}
                    className="order-card"
                    onClick={() => handleOrderClick(order.order_id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="order-header">
                      <h3>Order #: {order.order_id}</h3>
                      <span
                        className={`status-badge ${order.order_status.toLowerCase()}`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                    <div className="order-meta">
                      <p>
                        Date: {new Date(order.order_date).toLocaleDateString()}
                      </p>
                      <p>Total: ${order.total_amount?.toFixed(2)}</p>
                    </div>
                    {order.order_status.toLowerCase() === "pending" && (
                      <button
                        className="remove-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order.order_id);
                        }}
                        style={{
                          marginTop: "1rem",
                          padding: "0.5rem 1.5rem",
                          alignSelf: "flex-start",
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {showCashConfirmation && renderCashConfirmation()}
    </div>
  );
}

UserDashboard.propTypes = {
  navigate: PropTypes.func,
};

export default React.memo(UserDashboard);
