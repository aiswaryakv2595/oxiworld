const express = require('express')
const product_route = express()
const cookieParser = require("cookie-parser");


product_route.use(express.json())
product_route.use(express.urlencoded({extended:true}))
product_route.use(cookieParser());
const path = require('path')

product_route.set('view engine', 'ejs')
product_route.set('views', './views/users');
product_route.use(express.static(path.join(__dirname, "public")));
const session = require('express-session');

const config = require('../config/config')

const oneDay = 1000 * 60 * 60 * 24;
product_route.use(session({
    secret:config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
}))
product_route.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

const productController = require('../controllers/productController');

const userAuth = require('../middlewares/userAuth');
const { db } = require('../models/userModel');
product_route.get('/sort-ascending',userAuth.isLogin,productController.sortAscending)
product_route.get('/sort-decending',userAuth.isLogin,productController.sortDescending)
product_route.get('/filter',userAuth.isLogin,productController.filterCollections)

product_route.get('/searchitems',userAuth.isLogin,productController.searchItems)

module.exports = product_route;