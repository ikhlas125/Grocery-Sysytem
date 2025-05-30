const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productController");

router.get("/", productsController.getAllProducts);
router.post("/cart", productsController.handleCartOperation);
router.post("/checkout", productsController.checkout);
router.post("/orders", productsController.getCustomerOrders);
router.post("/order-details", productsController.getOrderDetails);
router.post("/addproducts", productsController.addProduct);
router.get("/categories", productsController.getCategories);
router.post("/vendorProducts", productsController.getVendorProducts);
router.post("/removeProducts", productsController.removeProducts);
router.post("/vendorOrders", productsController.getVendorOrders);
router.post("/addCategories", productsController.addCategories);
router.post("/cancel-Item", productsController.CancelProduct);
router.post("/cancel-order", productsController.CancelOrder);
router.post("/filter-category", productsController.getProductsbyCat);
router.post("/update-product", productsController.updateProduct);
router.post("/processOrder", productsController.ProcessOrder);
router.post("/salehistory", productsController.SalesHistory);
router.post("/salesDetails", productsController.HistoryDetails);

module.exports = router;
