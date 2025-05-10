import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./vendor.css";

function VendorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("add");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    if (activeTab === "history" && user && selectedProduct) {
      fetchSalesHistory();
    }
  }, [activeTab, user, selectedProduct]);
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.userType !== "vendor") {
      navigate("/login");
      return;
    }
    setUser(userData);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchVendorProducts();
    }
  }, [user]);

  const fetchSalesHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        "http://localhost:5000/api/products/salehistory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            vendor_id: user?.vendorId,
            product_id: selectedProduct,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error("Invalid sales data format from server");
      }

      setSalesHistory(result.data);
    } catch (error) {
      console.error("Fetch sales history error:", error);
      setError(error.message);
      setSalesHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendorOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        "http://localhost:5000/api/products/vendorOrders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            vendor_id: user?.vendorId,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error("Invalid orders data format from server");
      }

      // Directly use the raw data from API
      setOrders(result.data);
    } catch (error) {
      console.error("Fetch orders error:", error);
      setError(error.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the useEffect for tab changes
  useEffect(() => {
    if (activeTab === "ordered" && user) {
      fetchVendorOrders();
    }
  }, [activeTab, user]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/products/categories"
      );
      const data = await response.json();
      setCategories(data.data); // Requires API to return { data: [...] }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendorProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        "http://localhost:5000/api/products/vendorProducts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            vendor_id: user?.vendorId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  const handleAddProduct = async (productData) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/addproducts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json(); // Parse response once

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      return data; // Return data on success
    } catch (error) {
      console.error("Error adding product:", error);
      throw error; // Re-throw for form handling
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/removeProducts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ product_id: productId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove product");
      }

      // Update the UI by filtering out the removed product
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.product_id !== productId)
      );
      alert("Product removed successfully!");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddCategory = async (categoryName) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/addCategories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ category_name: categoryName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add category");
      }

      // Refresh categories list
      await fetchCategories();
      return data;
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  };

  const handleProcessOrder = async (orderId, orderDetailId) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products/processOrder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            order_detail_id: orderDetailId,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Processing failed");

      alert("Order processed successfully!");
      // Refresh orders list
      await fetchVendorOrders();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const renderAddProduct = () => (
    <div className="profile-settings">
      <h2>Add New Product</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const formData = {
              vendor_id: user?.vendorId,
              product_id: e.target.product_id.value,
              product_name: e.target.product_name.value,
              description: e.target.description.value,
              cat_name: e.target.cat_name.value,
              price: parseFloat(e.target.price.value),
              url: e.target.image_url.value,
              quantity: e.target.quantity.value,
            };

            await handleAddProduct(formData);
            e.target.reset(); // Clear form
            alert("Product added successfully!");
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        }}
      >
        <label>
          Product Id:
          <input
            name="product_id"
            required
            minLength="4"
            maxLength="4"
            placeholder="Enter product ID"
          />
        </label>
        <label>
          Product Name:
          <input
            name="product_name"
            required
            minLength="3"
            maxLength="255"
            placeholder="Enter product name"
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            required
            rows="4"
            placeholder="Product description..."
            maxLength="500"
          />
        </label>

        <label>
          Category:
          <select
            name="cat_name"
            required
            disabled={isLoading}
            className={isLoading ? "loading" : ""}
          >
            {isLoading ? (
              <option>Loading categories...</option>
            ) : (
              <>
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option
                    key={category.category_name}
                    value={category.category_name}
                  >
                    {category.category_name}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>

        <label>
          Price ($):
          <input
            type="number"
            name="price"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            inputMode="decimal"
          />
        </label>

        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            min="1"
            placeholder="Enter Quantity"
          />
        </label>

        <label>
          Image URL:
          <input name="image_url" placeholder="/images/image.jpg" />
        </label>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );

  const renderSalesHistory = () => (
    <div className="orders-grid">
      <h2>Sales History</h2>

      <div className="filter-section" style={{ marginBottom: "2rem" }}>
        <label className="seect">
          Select Product:
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={isLoading || products.length === 0}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.product_id} value={product.product_id}>
                {product.product_name} ({product.product_id})
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading sales history...</p>
        </div>
      ) : error ? (
        <div className="error-message">⚠️ Error loading history: {error}</div>
      ) : salesHistory.length === 0 ? (
        <p className="no-orders">No sales history found for this product</p>
      ) : (
        salesHistory.map((sale) => (
          <div key={sale.product_id} className="order-product-card">
            <div className="product-info">
              <img
                src={sale.image_url || "/placeholder-product.jpg"}
                alt={sale.product_name}
                className="product-thumbnail"
                onError={(e) => {
                  e.target.src = "/placeholder-product.jpg";
                }}
              />
              <div className="product-details">
                <h4>{sale.product_name}</h4>
                <p>Product ID: {sale.product_id}</p>
                <p>Quantity Sold: {sale.quantity}</p>
                <p>Unit Price: ${sale.unit_price?.toFixed(2)}</p>
                <p>Total Revenue: ${sale.total_price?.toFixed(2)}</p>
              </div>
            </div>
            <div className="order-meta">
              <p>
                <strong>Vendor ID:</strong> {sale.vendor_id}
              </p>
              <p>
                <strong>Last Sold Date:</strong>{" "}
                {new Date(sale.latest_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderUpdateForm = () => {
    if (!editingProduct) return null;

    return (
      <div className="profile-settings">
        <h2>Update Product</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const formData = {
                product_name: e.target.product_name.value,
                price: parseFloat(e.target.price.value),
                description: e.target.description.value,
                quantity: parseInt(e.target.quantity.value),
              };

              const response = await fetch(
                "http://localhost:5000/api/products/update-product",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify({
                    product_id: editingProduct.product_id,
                    ...formData,
                  }),
                }
              );

              const data = await response.json();
              if (!response.ok)
                throw new Error(data.message || "Update failed");

              await fetchVendorProducts();
              setEditingProduct(null);
              alert("Product updated successfully!");
            } catch (error) {
              alert(`Error: ${error.message}`);
            }
          }}
        >
          <label>
            Product Name:
            <input
              name="product_name"
              required
              defaultValue={editingProduct.product_name}
            />
          </label>

          <label>
            Price ($):
            <input
              type="number"
              name="price"
              step="0.01"
              defaultValue={editingProduct.price}
              required
            />
          </label>

          <label>
            Description:
            <textarea
              name="description"
              required
              defaultValue={editingProduct.description}
            />
          </label>

          <label>
            Quantity:
            <input
              type="number"
              name="quantity"
              defaultValue={editingProduct.quantity}
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Update Product
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setEditingProduct(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderAddCategory = () => (
    <div className="profile-settings">
      <h2>Add New Category</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const categoryName = e.target.category_name.value;
            const result = await handleAddCategory(categoryName);
            e.target.reset();
            alert(result.message); // Changed to use database message
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        }}
      >
        <label>
          Category Name:
          <input
            name="category_name"
            required
            minLength="3"
            maxLength="50"
            placeholder="Enter category name"
          />
        </label>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? "Adding Category..." : "Add Category"}
        </button>
      </form>
    </div>
  );

  const renderProducts = () => {
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

    if (products.length === 0) {
      return <p className="no-products">No products available at the moment</p>;
    }

    return (
      <div className="products-list">
        {products.map((product) => (
          <div key={product.product_id} className="product-card">
            <img
              src={product.image_url || "/placeholder-product.jpg"}
              alt={product.product_name}
              onError={(e) => {
                e.target.src = "/placeholder-product.jpg";
              }}
            />
            <h3>{product.product_name}</h3>
            <br></br>
            <p className="product-description">
              {product.description || "No description available"}
            </p>
            <p className="price">${product.price?.toFixed(2) || "0.00"}</p>
            <button className="add-to-cart">Remove</button>
          </div>
        ))}
      </div>
    );
  };

  const renderRemoveProduct = () => (
    <div className="products-list">
      {products.map((product) => (
        <div key={product.product_id} className="product-card">
          <img src={product.image_url} alt={product.product_name} />
          <h3>{product.product_name}</h3>
          <p className="price">${product.price?.toFixed(2)}</p>
          <p className="price">Quantity: {product.quantity}</p>
          <div className="product-actions">
            <button
              className="edit-btn"
              onClick={() => setEditingProduct(product)}
            >
              Edit
            </button>
            <button
              className="remove-item"
              onClick={() => handleRemoveProduct(product.product_id)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOrders = () => (
    <div className="orders-grid">
      <h2>Orders ({orders.length})</h2>
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className="error-message">⚠️ Error loading orders: {error}</div>
      ) : orders.length === 0 ? (
        <p className="no-orders">No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order.order_detail_id} className="order-product-card">
            <div className="order-header">
              <h3>Order #{order.order_detail_id}</h3>
              <div className="order-actions">
                <span
                  className={`status-badge ${order.order_status.toLowerCase()}`}
                >
                  {order.od_status}
                </span>
                <button
                  className="process-order-btn"
                  disabled={order.od_status.toLowerCase() !== "pending"}
                  onClick={() =>
                    handleProcessOrder(order.order_id, order.order_detail_id)
                  }
                >
                  Mark as Completed
                </button>
              </div>
            </div>
            {/* Existing product details - keep all these elements */}
            <div className="product-info">
              <img
                src={order.image_url || "/placeholder-product.jpg"}
                alt={order.product_name}
                className="product-thumbnail"
                onError={(e) => {
                  e.target.src = "/placeholder-product.jpg";
                }}
              />
              <div className="product-details">
                <h4>{order.product_name}</h4>
                <p>Product ID: {order.product_id}</p>
                <p>Quantity: {order.quantity}</p>
                <p>Unit Price: ${order.unit_price?.toFixed(2)}</p>
                <p>Total: ${(order.unit_price * order.quantity)?.toFixed(2)}</p>
              </div>
            </div>
            <div className="order-meta">
              <p>
                <strong>Customer:</strong> {order.full_name}
              </p>
              <p>
                <strong>Address:</strong> {order.address}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {new Date(order.order_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Payment Method:</strong> {order.payment_method}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <div className="profile-picture">
            {user?.name?.[0]?.toUpperCase() || "V"}
          </div>
          <h3>{user?.business_name || "Vendor"}</h3>
          <p>{user?.email || ""}</p>
        </div>

        <nav className="dashboard-nav">
          <button
            className={activeTab === "home" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            🏠 Home
          </button>
          <button
            className={activeTab === "add" ? "active" : ""}
            onClick={() => setActiveTab("add")}
          >
            ➕ Add Product
          </button>
          <button
            className={activeTab === "remove" ? "active" : ""}
            onClick={() => setActiveTab("remove")}
          >
            📂 Add Category
          </button>

          <button
            className={activeTab === "ordered" ? "active" : ""}
            onClick={() => setActiveTab("ordered")}
          >
            📦 Customer Orders
          </button>

          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            🕘 Sales History
          </button>
        </nav>
      </div>

      <div className="dashboard-main ">
        {activeTab === "home" && (
          <div className="products-grid">
            <h2>Available Products ({products.length})</h2>
            {editingProduct ? renderUpdateForm() : renderRemoveProduct()}
          </div>
        )}
        {activeTab === "add" && renderAddProduct()}
        {activeTab === "remove" && renderAddCategory()}
        {activeTab === "ordered" && renderOrders()}
        {activeTab === "history" && renderSalesHistory()}
      </div>
    </div>
  );
}

VendorDashboard.propTypes = {
  navigate: PropTypes.func,
};

export default React.memo(VendorDashboard);
