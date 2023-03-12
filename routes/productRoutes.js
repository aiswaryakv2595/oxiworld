const express = require('express')
const product_route = express()

const path = require('path')

product_route.set('views', './views/users');
product_route.use(express.static(path.join(__dirname, "public")));

const productController = require('../controllers/productController');

const userAuth = require('../middlewares/userAuth');
const { db } = require('../models/userModel');

product_route.get("/collection", userAuth.isLogin, productController.showCollections);
// product_route.get('/getfilters',userAuth.isLogin,productController.getFilters)

product_route.get('/productdetails/:id',userAuth.isLogin,productController.productDetails)

// product_route.get('/searchitems',userAuth.isLogin,productController.searchItems)

product_route.post('/products/filter/price', userAuth.isLogin,productController.searchPrice)
// product_route.post('/products/search', userAuth.isLogin,productController.searchProducts)
  
module.exports = product_route;