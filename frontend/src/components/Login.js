import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      console.log(data.customerId);
      console.log(data.vendorId);

      console.log(data.userType);
      console.log(data.name);
  
      // Store token and user data
      if(data.userType=='customer'){
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        name: data.name,
        email: data.email,
        userType: data.userType,
        customerId: data.customerId  // Add customer ID
      }));
    }
    if(data.userType=='vendor'){
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        name: data.name,
        email: data.email,
        userType: data.userType,
        vendorId: data.vendorId  // Add customer ID
      }));
    }
  
      // Show stored procedure message
      alert(data.message);
  
      // Redirect based on user type
      const redirectPath = data.userType === 'vendor' 
      ? '/vendor-dashboard'
      : '/user-dashboard';
    
    navigate(redirectPath);
    } catch (error) {
      alert(error.message);
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <h2>Login to FreshMart</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
        />
        <input 
          type="password" 
          name="password"
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Login</button>
      </form>
      <p className="Register-Link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;