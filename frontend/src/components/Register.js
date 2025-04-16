import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    userType: 'customer' // default to customer
  });

  const [errors, setErrors] = useState({
    passwordMatch: '',
    passwordStrength: '',
    phone: '',
    email: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear errors when user types
    if (name === 'confirmPassword' || name === 'password') {
      setErrors({
        ...errors,
        passwordMatch: ''
      });
    }
    if (name === 'phone') {
      setErrors({
        ...errors,
        phone: ''
      });
    }
    if (name === 'email') {
      setErrors({
        ...errors,
        email: ''
      });
    }
  };

  const handleUserTypeChange = (type) => {
    setFormData({
      ...formData,
      userType: type
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      passwordMatch: '',
      passwordStrength: '',
      phone: '',
      email: ''
    };

    // Password matching validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.passwordMatch = "Passwords don't match";
      isValid = false;
    }

    // Password strength validation
    if (formData.password.length < 6) {
      newErrors.passwordStrength = "Password must be at least 6 characters";
      isValid = false;
    }

    // Phone number validation (simple format check)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
  
        const data = await response.json();
        localStorage.setItem('token', data.token);
        //alert('Registration successful! Redirecting...');
        navigate('/login');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Create New Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <p className="error-message">{errors.phone}</p>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="address"
            placeholder="Full Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className={errors.passwordStrength ? 'error' : ''}
          />
          {errors.passwordStrength && (
            <p className="error-message">{errors.passwordStrength}</p>
          )}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={errors.passwordMatch ? 'error' : ''}
          />
          {errors.passwordMatch && (
            <p className="error-message">{errors.passwordMatch}</p>
          )}
        </div>

        <div className="user-type-container">
          <label>I am a:</label>
          <div className="checkbox-options">
            <label className={`checkbox-label ${formData.userType === 'customer' ? 'active' : ''}`}>
              <input
                type="checkbox"
                name="userTypeCustomer"
                checked={formData.userType === 'customer'}
                onChange={() => handleUserTypeChange('customer')}
                className="hidden-checkbox"
              />
              <span className="custom-checkbox"></span>
              Customer
            </label>
            
            <label className={`checkbox-label ${formData.userType === 'vendor' ? 'active' : ''}`}>
              <input
                type="checkbox"
                name="userTypeVendor"
                checked={formData.userType === 'vendor'}
                onChange={() => handleUserTypeChange('vendor')}
                className="hidden-checkbox"
              />
              <span className="custom-checkbox"></span>
              Vendor
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Register
        </button>
      </form>
      <p className="login-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;