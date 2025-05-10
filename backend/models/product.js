const { Decimal } = require("mssql");
const { sql, poolPromise } = require("../config/db");

const Products = {
  async getAllProducts() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().execute("get_product_catalogue");
      return result.recordset || [];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fetch products");
    }
  },

  async addToCart(customerId, productName, quantity, action = "add") {
    try {
      const pool = await poolPromise;
      const request = pool
        .request()
        .input("p_customer_id", sql.VarChar(6), customerId) // CHANGED parameter
        .input("p_action", sql.VarChar(10), action);

      if (productName) {
        request.input("p_product_name", sql.VarChar(255), productName);
      }

      if (
        ["add", "update", "remove", "decrease"].includes(action.toLowerCase())
      ) {
        request.input("p_quantity", sql.Int, quantity);
      }

      const result = await request.execute("add_to_cart");

      return {
        success: true,
        message: `Item ${action}ed successfully`,
        data: result.recordset,
      };
    } catch (error) {
      console.error("Database error:", error);
      throw new Error(error.message || "Failed to update cart");
    }
  },

  async getCartItems(customerId) {
    // CHANGED parameter
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("cus_id", sql.VarChar(6), customerId) // CHANGED input name
        .execute("get_cart_items");

      return result.recordset.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url, // Add this if available in your products table
      }));
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fetch cart items");
    }
  },

  async checkout(customerid, payment) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("customerid", sql.VarChar(6), customerid)
        .input("payment", sql.VarChar(50), payment)
        .execute("checkout");
      return result.recordset[0].message;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to process checkout");
    }
  },

  async getOrders(customerid) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("customerid", sql.VarChar(6), customerid)
        .execute("get_orders");
      return result.recordset.map((order) => ({
        order_id: order.order_id,
        order_date: order.order_date,
        order_status: order.order_status,
        total_amount: order.total_amount,
      }));
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to process Orders");
    }
  },

  async getOrdersDetails(orderid) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("orderid", sql.VarChar(6), orderid)
        .execute("get_orders_details");
      return result.recordset.map((details) => ({
        product_id: details.product_id,
        order_detail_id: details.order_detail_id,
        image_url: details.image_url,
        product_name: details.product_name,
        quantity: details.quantity,
        unit_price: details.unit_price,
      }));
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to process Orders Details");
    }
  },

  addProducts: async (
    vendor_id,
    product_id,
    product_name,
    cat_name,
    price,
    description,
    url,
    quantity
  ) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("vendor_id", sql.VarChar(6), vendor_id)
        .input("product_id", sql.VarChar(6), product_id)
        .input("product_name", sql.VarChar(255), product_name)
        .input("cat_name", sql.VarChar(50), cat_name)
        .input("price", sql.Decimal(10, 2), price)
        .input("description", sql.VarChar(500), description)
        .input("url", sql.VarChar(100), url)
        .input("quantity", sql.Int, quantity)
        .execute("addProduct");

      return result.recordset[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error(error.message || "Failed to add product");
    }
  },

  async getAllCategories() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().execute("getCategories");
      return result.recordset || [];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fetch");
    }
  },

  async getVendorProducts(vendor_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("vendor_id", sql.VarChar(6), vendor_id)
        .execute("getVendorProducts");
      return result.recordset || [];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fetch products");
    }
  },

  async removeProducts(product_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("product_id", sql.VarChar(6), product_id)
        .execute("removeProducts");
      return result.recordset[0].message;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to delete product");
    }
  },

  async getVendorOrders(vendor_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("vendor_id", sql.VarChar(6), vendor_id)
        .execute("get_vendor_orders");
      return result.recordset || [];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fecth orders");
    }
  },

  async addCategories(category_name) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("category_name", sql.VarChar(50), category_name)
        .execute("addCategory");
      return result.recordset[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to add category");
    }
  },

  async getQuantity(productName) {
    // Changed parameter name
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("product_name", sql.VarChar(50), productName)
        .query(
          "SELECT quantity FROM products WHERE product_name = @product_name"
        );

      if (result.recordset.length === 0) {
        throw new Error(`Product '${productName}' not found`); // Updated error message
      }

      return result.recordset[0].quantity;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get product quantitys");
    }
  },

  async CancelProduct(order_detail_id, product_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("order_detail_id", sql.VarChar(6), order_detail_id)
        .input("product_id", sql.VarChar(6), product_id)
        .execute("CancelProduct");

      return result.recordset[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to remove product");
    }
  },

  async CancelOrder(order_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("order_id", sql.VarChar(6), order_id)
        .execute("CancelOrder");

      return result.recordset[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to remove product");
    }
  },

  async getProductsbyCat(category_name) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("category_name", sql.VarChar(50), category_name)
        .execute("getProductsbyCat");

      return result.recordset || [];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get products");
    }
  },

  async updateProduct(product_id, product_name, price, description, quantity) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("product_id", sql.VarChar(6), product_id)
        .input("product_name", sql.VarChar(50), product_name)
        .input("price", sql.Float, price)
        .input("description", sql.VarChar(255), description)
        .input("quantity", sql.Int, quantity)
        .execute("updateProduct");

      return result.recordset[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to update products");
    }
  },

  async ProcessOrder(order_id, order_detail_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("order_id", sql.VarChar(6), order_id)
        .input("order_detail_id", sql.VarChar(6), order_detail_id)
        .execute("ProcessOrder");

      return result.recordset[0];
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to process order");
    }
  },

  async getSalesHistory(vendor_id, product_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("vendor_id", sql.VarChar(6), vendor_id)
        .input("product_id", sql.VarChar(6), product_id)
        .execute("getProductHistory");
      return result.recordset.map((details) => ({
        product_id: details.product_id,
        product_name: details.product_name,
        quantity: details.quantity_sold,
        unit_price: details.unit_price,
        total_price: details.total_price,
        image_url: details.image_url,
        vendor_id: details.vendor_id,
        latest_date: details.latest_date,
      }));
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get history");
    }
  },

  async HistoryDetails(product_id, vendor_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("product_id", sql.VarChar(6), product_id)
        .input("vendor_id", sql.VarChar(6), vendor_id)
        .execute("getProductHistoryDetails");
      return result.recordset.map((details) => ({
        customer_id: details.customer_id,
        customer_name: details.customer_name,
        sold_date: details.sold_date,
      }));
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to get history details");
    }
  },
};

module.exports = Products;
