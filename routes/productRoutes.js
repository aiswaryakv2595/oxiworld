const express = require('express')
const product_route = express()

const path = require('path')

product_route.set('views', './views/users');
product_route.use(express.static(path.join(__dirname, "public")));

const productController = require('../controllers/productController');

const userAuth = require('../middlewares/userAuth');
const { db } = require('../models/userModel');
product_route.get('/sort-ascending',userAuth.isLogin,productController.sortAscending)
product_route.get('/sort-decending',userAuth.isLogin,productController.sortDescending)
product_route.get('/filter',userAuth.isLogin,productController.filterCollections)

product_route.get('/productdetails/:id',userAuth.isLogin,productController.productDetails)

product_route.get('/searchitems',userAuth.isLogin,productController.searchItems)
product_route.post('/category/products', userAuth.isLogin,productController.searchCategory)
product_route.post('/brands/products', userAuth.isLogin,productController.searchBrand)
product_route.get('/color/:color/products', userAuth.isLogin,productController.searchColor)
product_route.get('/material/:material/products', userAuth.isLogin,productController.searchMaterial)
product_route.post('/products/filter/price', userAuth.isLogin,productController.searchPrice)
product_route.post('/products/search', userAuth.isLogin,productController.searchProducts)
  
module.exports = product_route;