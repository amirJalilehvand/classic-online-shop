//adding new comments

//importing our 3rd party Packages and functions we need
const { body } = require('express-validator/check')
const express = require('express');

//importing our authentication middleware we define in "middleware" folder
const isAuth = require('../middleware/isAuth');

//importing our controller we define in "controllers" folder
const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth , adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth,
[
    body(
        'title' ,
        'the title should be at least 3 characters long string'
    )
        .isString()
        .isLength({min: 3})
        .trim()
    ,
    body('price')
        .isFloat()
    ,
    body(
        'description' ,
        'the description should be at least 5 and up to 420 characters long string'
    )
        .isLength({min: 5})
        .trim()
] ,
 adminController.postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/add-product => POST
router.post('/edit-product', isAuth, 
[
    body(
        'title' ,
        'the title should be at least 3 characters long string'
    )
        .isString()
        .isLength({min: 3})
        .trim()
    , 
    body('price')
        .isFloat()
    ,
    body(
        'description' ,
        'the description should be at least 5 and up to 420 characters long string'
    )
        .isLength({min: 5})
        .trim()
] , adminController.postEditProduct);

// /admin/delete-product => POST
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
