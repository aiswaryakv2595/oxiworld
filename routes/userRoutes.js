const express = require('express')
const user_route = express()
const cookieParser = require("cookie-parser");


user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))
user_route.use(cookieParser());
const path = require('path')

user_route.set('view engine', 'ejs')
user_route.set('views', './views/users');
user_route.use(express.static(path.join(__dirname, "public")));
const session = require('express-session');

const config = require('../config/config')

const oneDay = 1000 * 60 * 60 * 24;
user_route.use(session({
    secret:config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
}))
user_route.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

const userController = require('../controllers/userController');

const userAuth = require('../middlewares/userAuth');
const { db } = require('../models/userModel');

user_route.get('/register',userAuth.isLogout,userController.register);
user_route.post('/register',userController.saveUser);

user_route.get('/login',userAuth.isLogout,userController.loadLogin)
user_route.post('/login',userController.verifyLogin)

// router.get('/otp',userAuth.isLogout,userController.getOtp)
// router.post('/otp',userController.addUser)

user_route.get('/logout',userAuth.isLogin,userController.logout)

user_route.get('/',userController.profile)
user_route.get('/profile',userAuth.authPage(["user"]),userAuth.isLogin,userController.profile)

user_route.get('/productdetails/:id',userAuth.isLogin,userController.productDetails)


module.exports = user_route;



