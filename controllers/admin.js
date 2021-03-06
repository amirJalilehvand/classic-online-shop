const {validationResult} = require('express-validator/check');
const fileHelper = require('../util/file')

const Product = require('../models/product');

const ITEMS_PER_PAGE = 3; 

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError : false ,
    errorMessage: null ,
    validationError: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError : true , 
      product : {
        title : title , 
        price : price , 
        description : description
      } ,
      errorMessage: errors.array()[0].msg ,
      validationError: errors.array()
    })
  }

  if(!image){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError : true , 
      product : {
        title : title , 
        price : price , 
        description : description
      } ,
      errorMessage: 'the image must be in PNG , JPG or JPEG format' ,
      validationError: errors.array()
    })
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result =>{
      //console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      /*return res.status(500).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError : true , 
        product : {
          title : title , 
          imageUrl : imageUrl , 
          price : price , 
          description : description
        } ,
        errorMessage: 'sorry something went wrong...please try again' ,
        validationError: []
      })*/
      //res.redirect('/500')
      console.log(err);
      const error =new Error(err) 
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getEditProduct = (req, res, next) =>{
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product',{
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false ,
        validationError: [] ,
        errorMessage: null
      });
    })
    .catch(err => {
      console.log(err);
      const error =new Error(err) 
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postEditProduct = (req, res, next) =>{
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors);
    return res.status(422).render('admin/edit-product',{
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError : true , 
      product : {
        title : updatedTitle , 
        price : updatedPrice , 
        description : updatedDesc,
        _id : prodId
      } ,
      errorMessage: errors.array()[0].msg ,
      validationError: errors.array()
    })
  }

  Product.findOne({_id: prodId , userId: req.user._id})
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(updatedImage){
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl = updatedImage.path;
      }
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
      const error =new Error(err) 
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const page= +req.query.page || 1;
  let totalItems ;
  Product.countDocuments()
    .then(productsQuantity => {
      totalItems = productsQuantity;
      return Product.find({userId: req.user._id})
        .skip((page-1)*ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
          .then(products => {
            res.render('admin/products', {
              prods: products,
              pageTitle: 'Admin Products',
              path: '/admin/products',
              totalProducts: totalItems,
              currentPage : page ,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
          })
          .catch(err => {
            console.log(err);
            const error =new Error(err) 
            error.httpStatusCode = 500;
            next(error);
          });
    };  

exports.postDeleteProduct = (req, res, next) =>{
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      if(!product){
        throw new Error('product not found')
      }
      fileHelper.deleteFile(product.imageUrl)
      Product.deleteOne({_id: prodId , userId: req.user._id})
        .then( () => {
          console.log('DESTROYED PRODUCT');
          res.redirect('/admin/products');
    }) 
    .catch(err =>{
      console.log(err);
      const error =new Error(err) 
      error.httpStatusCode = 500;
      next(error);
    });
  });
}