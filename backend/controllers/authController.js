const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create(req.body);
    
    res.status(201).json({
      userId: user.user_id,
      name: user.username,
      email: user.email,
      userType: user.user_type,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await User.Login(req.body);
    
    if (result.message.includes('Invalid')) {
      return res.status(401).json({ error: result.message });
    }

    let customerId = null;
    // Only fetch customer ID for regular users
    if (result.userType === 'customer') {
      try {
        customerId = await User.getCustomerId(result.userId);
      } catch (error) {
        console.error('Customer ID lookup failed:', error.message);
      }
    }

    let vendorId = null;
    if(result.userType==='vendor'){
      try {
        vendorId = await User.getVendorId(result.userId);
      } catch (error) {
        console.error('Vendor ID lookup failed:', error.message);
      }
    }

    if (result.userType === 'customer') {
    res.json({
      userId: result.userId,
      name: result.username,
      email: result.email,
      userType: result.userType,
      customerId: customerId,
      message: result.message
    });
   }
   if(result.userType==='vendor'){
    res.json({
      userId: result.userId,
      name: result.username,
      email: result.email,
      userType: result.userType,
      vendorId: vendorId,
      message: result.message
    });
   }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};