import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <h1>Cartify</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/Products">Products</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/login" className="login-btn">Login</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            <section className="hero">
              <div className="hero-content">
                <h2>Fresh Groceries Delivered to Your Door</h2>
                <p>Get high-quality fruits, vegetables, and pantry staples with same-day delivery</p>
                <Link to="/products" className="cta">Shop Now</Link>
              </div>
            </section>

            <section className="categories">
              <h3>Popular Categories</h3>
              <div className="category-grid">
                <div className="category-card">
                  <img src="https://cdn-icons-png.flaticon.com/512/135/135367.png" alt="fruits" />
                  <h4>Fresh Fruits</h4>
                </div>
                <div className="category-card">
                  <img src="https://cdn-icons-png.flaticon.com/512/2329/2329865.png" alt="vegetables" />
                  <h4>Vegetables</h4>
                </div>
                <div className="category-card">
                  <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="dairy" />
                  <h4>Dairy Products</h4>
                </div>
              </div>
            </section>
          </>
        } />
      </Routes>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h5>Follow Us</h5>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2023 FreshMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;