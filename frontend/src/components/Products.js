import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Products.css';

function Products() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Invalid data format from server');
      }
      
      setProducts(result.data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (productId) => {
   navigate('/login')
  };

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
        <div className="error-message">
          <p>⚠️ Error loading products: {error}</p>
          <button onClick={fetchProducts} className="retry-button">
            Retry
          </button>
        </div>
      );
    }

    if (products.length === 0 && !isLoading) {
      return (
        <div className="no-products">
          <p>No products available at the moment</p>
          <button onClick={fetchProducts} className="refresh-button">
            Refresh
          </button>
        </div>
      );
    }

    return (
      <div className="products-list">
        {products.map(product => (
          <div key={product.product_id} className="product-card">
            <img 
              src={product.image_url || '/placeholder-product.jpg'} 
              alt={product.product_name}
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
              className="product-image"
            />
            <div className="product-details">
              <h3>{product.product_name}</h3>
              <p className="product-description">
                {product.description || 'No description available'}
              </p>
              <p className="price">${product.price?.toFixed(2) || '0.00'}</p>
              <button 
                className="add-to-cart"
                onClick={() => handleAddToCart(product.product_id)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="products-container">
      <nav className="navbar">
        <h1>Cartify</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/Products">Products</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/login" className="login-btn">Login</Link>
        </div>
      </nav>

      <div className="products-header">
        <h2>Available Products ({products.length})</h2>
        <button onClick={fetchProducts} className="refresh-button">
          Refresh List
        </button>
      </div>
      {renderProducts()}
    </div>
  );
}

Products.propTypes = {
  // Add any props validation if needed
};

export default Products;