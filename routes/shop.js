//adding new comments

//importing our 3rd party Packages and functions we need
const express = require('express');
const isAuth = require('../middleware/isAuth');
//importing our controller we define in "controllers" folder
const shopController = require('../controllers/shop');

const router = express.Router();

// / => GET
router.get('/', shopController.getIndex);
// /products => GET
router.get('/products', shopController.getProducts);
// /products/:productId => GET
router.get('/products/:productId', shopController.getProduct);
// /cart => GET
router.get('/cart', isAuth, shopController.getCart);
// /cart => POST
router.post('/cart', isAuth, shopController.postCart);
// /cart-delete-item => POST
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
// /checkout => POST
router.get('/checkout' , isAuth , shopController.getCheckout)
// /create-order => POST
router.post('/create-order', isAuth,shopController.postOrder);
// /orders => GET
router.get('/orders', isAuth, shopController.getOrders);
// /orders/:orderId => GET
router.get('/orders/:orderId' , isAuth, shopController.getInvoice)

module.exports = router;
