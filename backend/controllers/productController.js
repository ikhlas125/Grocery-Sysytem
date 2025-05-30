const ProductModel = require("../models/product");

const productsController = {
  getAllProducts: async (req, res) => {
    try {
      const products = await ProductModel.getAllProducts();
      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching products",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        data: [],
      });
    }
  },

  handleCartOperation: async (req, res) => {
    try {
      const { customerId, productName, quantity, action } = req.body;
      const validActions = ["add", "remove", "update", "get", "decrease"];

      // Validation
      if (!customerId || !validActions.includes(action?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters or invalid action",
        });
      }

      if (action === "get") {
        const cartItems = await ProductModel.getCartItems(customerId);
        return res.status(200).json({
          success: true,
          message: "Cart retrieved successfully",
          data: cartItems,
        });
      }

      if (!productName || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing product name or quantity",
        });
      }

      const availableQuantity = await ProductModel.getQuantity(productName);

      if (action === "update") {
        // Check if product is out of stock
        if (availableQuantity === 0) {
          return res.status(400).json({
            success: false,
            message: "This product is currently out of stock",
          });
        }
      }

      const result = await ProductModel.addToCart(
        customerId, // CHANGED from customerName
        productName,
        quantity,
        action
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Controller error:", error);
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Express.js controller for checkout
  checkout: async (req, res) => {
    const { customerid, payment } = req.body;

    try {
      const message = await ProductModel.checkout(customerid, payment);

      if (message === "Customer not found") {
        return res.status(404).json({ success: false, error: message });
      }

      res.status(200).json({
        success: true,
        message: "Checkout completed successfully",
        orderMessage: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  },
  getCustomerOrders: async (req, res) => {
    try {
      const { customerid } = req.body;

      if (!customerid) {
        return res.status(400).json({
          success: false,
          message: "Customer ID is required",
        });
      }

      const orders = await ProductModel.getOrders(customerid);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error("Order controller error:", error);
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const { orderid } = req.body;

      if (!orderid) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const orderDetails = await ProductModel.getOrdersDetails(orderid);

      if (orderDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No details found for this order",
        });
      }

      res.status(200).json({
        success: true,
        count: orderDetails.length,
        data: orderDetails,
      });
    } catch (error) {
      console.error("Order details controller error:", error);
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  addProduct: async (req, res) => {
    try {
      const {
        vendor_id,
        product_id,
        product_name,
        cat_name,
        price,
        description,
        url,
        quantity,
      } = req.body;

      // Validation
      if (!vendor_id || !product_name || !cat_name || !price || !description) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      if (isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number",
        });
      }

      // Call the model method directly
      const result = await ProductModel.addProducts(
        vendor_id,
        product_id,
        product_name,
        cat_name,
        price,
        description,
        url,
        quantity
      );

      res.status(201).json({
        success: true,
        message: "Product added successfully",
        data: {
          product_id: result.product_id,
          product_name,
          price,
          description,
          image_url: url,
        },
      });
    } catch (error) {
      console.error("[ProductController] Error:", error);
      const statusCode = error.message.includes("validation") ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Product addition failed",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await ProductModel.getAllCategories();

      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      console.error("[CategoryController] Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  getVendorProducts: async (req, res) => {
    try {
      const { vendor_id } = req.body;
      if (!vendor_id) {
        return res.status(400).json({
          success: false,
          message: "Vendor ID is required",
        });
      }

      const products = await ProductModel.getVendorProducts(vendor_id);
      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching productss",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        data: [],
      });
    }
  },

  removeProducts: async (req, res) => {
    try {
      const { product_id } = req.body;

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      // Get the message from the stored procedure execution
      const message = await ProductModel.removeProducts(product_id);

      // Check if the message indicates the product is in pending orders
      if (message.includes("cannot be deleted")) {
        return res.status(409).json({
          // 409 Conflict status code
          success: false,
          message: message,
        });
      }

      return res.status(200).json({
        success: true,
        message: message,
      });
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getVendorOrders: async (req, res) => {
    try {
      const { vendor_id } = req.body;
      const products = await ProductModel.getVendorOrders(vendor_id);
      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching products",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        data: [],
      });
    }
  },

  addCategories: async (req, res) => {
    try {
      const { category_name } = req.body;

      const result = await ProductModel.addCategories(category_name);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          category_id: result.category_id,
          category_name,
        },
      });
    } catch (error) {
      console.error("[ProductController] Error:", error);
      const statusCode = error.message.includes("validation") ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Category Addition failed",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  CancelProduct: async (req, res) => {
    try {
      const { order_detail_id, product_id } = req.body;

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      if (!order_detail_id) {
        return res.status(400).json({
          success: false,
          message: "Order Detail ID is required",
        });
      }

      const result = await ProductModel.CancelProduct(
        order_detail_id,
        product_id
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  CancelOrder: async (req, res) => {
    try {
      const { order_id } = req.body;

      if (!order_id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const result = await ProductModel.CancelOrder(order_id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getProductsbyCat: async (req, res) => {
    try {
      const { category_name } = req.body;

      const products = await ProductModel.getProductsbyCat(category_name);

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { product_id, product_name, price, description, quantity } =
        req.body;
      if (!product_name || !price || !description) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      if (isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number",
        });
      }

      const result = await ProductModel.updateProduct(
        product_id,
        product_name,
        price,
        description,
        quantity
      );

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          product_id: result.product_id,
          product_name,
          price,
          description,
          quantity,
        },
      });
    } catch (error) {
      console.error("[ProductController] Error:", error);
      const statusCode = error.message.includes("validation") ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Product updation failed",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  ProcessOrder: async (req, res) => {
    try {
      const { order_id, order_detail_id } = req.body;
      if (!order_id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }
      if (!order_detail_id) {
        return res.status(400).json({
          success: false,
          message: "OrderDetail ID is required",
        });
      }
      const result = await ProductModel.ProcessOrder(order_id, order_detail_id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("[ProductController] Error:", error);
      const statusCode = error.message.includes("validation") ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Order processing failed",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  SalesHistory: async (req, res) => {
    try {
      const { vendor_id, product_id } = req.body;

      if (!vendor_id) {
        return res.status(400).json({
          success: false,
          message: "Valid Vendor ID (6 chars) is required",
        });
      }

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: "Valid Product ID (6 chars) is required",
        });
      }

      const products = await ProductModel.getSalesHistory(
        vendor_id,
        product_id
      );

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching history",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        data: [],
      });
    }
  },

  HistoryDetails: async (req, res) => {
    try {
      const { product_id, vendor_id } = req.body;

      if (!vendor_id) {
        return res.status(400).json({
          success: false,
          message: "Valid Vendor ID (6 chars) is required",
        });
      }

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: "Valid Product ID (6 chars) is required",
        });
      }

      const products = await ProductModel.HistoryDetails(product_id, vendor_id);

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching history Details",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        data: [],
      });
    }
  },
};

module.exports = productsController;
