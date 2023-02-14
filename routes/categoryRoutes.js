const express = require('express')
const category_route = express()
const cookieParser = require("cookie-parser");
const Filter = require('../models/filterModel')


category_route.use(express.json())
category_route.use(express.urlencoded({extended:true}))

category_route.use(cookieParser());

category_route.set('view engine', 'ejs')
category_route.set('views', './views/admin');
category_route.use(express.static('public'));



const session = require('express-session');

const config = require('../config/config')
const oneDay = 1000 * 60 * 60 * 24;
category_route.use(session({
    secret:config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
}))
// category_route.use(fileUpload())

const multer = require('../middlewares/multer')
category_route.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});