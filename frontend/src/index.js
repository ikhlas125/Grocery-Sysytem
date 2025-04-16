import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/User-dashboard';
import CardPaymentForm from './components/CardPaymentForm';
import Products  from './components/Products';
import VendorDashboard from './components/Vendor-dashboard';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/cardpaymentform" element={<CardPaymentForm/>}/>
        <Route path="/Products" element={<Products/>}/>
        <Route path="/vendor-dashboard" element={<VendorDashboard/>}/>
      </Routes>
    </Router>
  </React.StrictMode>
);