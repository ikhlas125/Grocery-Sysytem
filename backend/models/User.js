const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = {
  async create({ name, email, phone, address, password, userType }) {
    try {
      const pool = await poolPromise;
      
      await pool.request()
        .input('username', sql.VarChar(50), name)
        .input('password', sql.VarChar(255), password)
        .input('email', sql.VarChar(100), email)
        .input('userType', sql.VarChar(10), userType)
        .input('address', sql.VarChar(255), address)
        .input('phone', sql.VarChar(20), phone)
        .execute('SignUp');

      return this.findByEmail(email);
    } catch (error) {
      throw new Error('Registration failed: ' + error.message);
    }
  },

  async Login({ email, password }) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('email', sql.VarChar(50), email)
        .input('password', sql.VarChar(50), password)
        .execute('Loginn');
  
      // Get the first record from the result
      const spResult = result.recordset[0];
      
      if (!spResult.userId) {
        throw new Error(spResult.message);
      }
  
      // Combine stored procedure result with user data
      const userDetails = await this.findByEmail(email);
      return { ...userDetails, ...spResult };
    } catch (error) {
      throw new Error('Login failed: ' + error.message);
    }
  },

  async findByEmail(email) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('email', sql.VarChar(100), email)
        .query('SELECT * FROM users WHERE email = @email');
      
      return result.recordset[0];
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  },

  async getCustomerId(userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('userid', sql.VarChar(6), userId)
        .execute('getCustID');
      
      return result.recordset[0].customer_id;
    } catch (error) {
      throw new Error('Failed to fetch customer ID: ' + error.message);
    }
  },

  async getVendorId(userId){
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('userid', sql.VarChar(6), userId)
        .execute('getVenID');
      
      return result.recordset[0].vendor_id;
      console.log(result.recordset[0].vendor_id);
    } catch (error) {
      throw new Error('Failed to fetch customer ID: ' + error.message);
    }
  }
};

module.exports = User;