const express = require('express')
const admin_route = express()
const cookieParser = require("cookie-parser");
const Filter = require('../models/filterModel')


admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))

admin_route.use(cookieParser());

admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin');
admin_route.use(express.static('public'));



const session = require('express-session');

const config = require('../config/config')
const oneDay = 1000 * 60 * 60 * 24;
admin_route.use(session({
    secret:config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
}))
// admin_route.use(fileUpload())

const multer = require('../middlewares/multer')
admin_route.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

const adminController = require('../controllers/adminController')

const adminLoginAuth = require('../middlewares/adminLoginAuth');
const filterModel = require('../models/filterModel');
const categoryModel = require('../models/categoryModel');

admin_route.get('/admin-setup',adminController.adminSetup)
admin_route.post('/admin-setup',adminController.adminSetupSave)

admin_route.get('/login',adminLoginAuth.isLogout,adminController.loadLogin)
admin_route.post('/login',adminController.verifyLogin)

admin_route.get('/logout',adminLoginAuth.isLogin,adminController.logout)

admin_route.get('/dashboard',adminLoginAuth.authPage(["admin"]) ,adminLoginAuth.isLogin,adminController.dashboard);

admin_route.get('/showusers',adminLoginAuth.isLogin,adminController.showUsers);
//-----------item-------

admin_route.get('/additems',adminLoginAuth.isLogin,adminController.addItems)
admin_route.post('/additems',multer.upload.array('images',3),adminController.addItemSave)

admin_route.get('/edit_item/:id',adminLoginAuth.isLogin,adminController.editItem);
admin_route.post('/updateitem/:id',multer.upload.array('images',3),adminController.updateItem);

admin_route.get('/toggleitem/:id',adminLoginAuth.isLogin,adminController.deleteItem);

admin_route.get('/delete-image',adminLoginAuth.isLogin,adminController.deleteItemImage);

//----------end---------
//------category-----
//add category
admin_route.get('/addcategory',adminLoginAuth.isLogin,adminController.addCategory)
admin_route.post('/addcategory',multer.upload.single('image'),adminController.addCategorySave)

admin_route.get('/editCategory/:categoryid',adminLoginAuth.isLogin,adminController.editCategory)
admin_route.post('/updateCategory',multer.upload.single('image'),adminController.updateCategory)

admin_route.get('/togglecategory/:id',adminLoginAuth.isLogin,adminController.deleteCategory)


//--end category---

admin_route.get('/edituser/:userid',adminLoginAuth.isLogin,adminController.editUser)
admin_route.post('/updateuser',adminLoginAuth.isLogin,adminController.updateUser)

admin_route.post('/banuser/:userid',adminLoginAuth.isLogin,adminController.banUser)
admin_route.post('/removeban/:userid',adminLoginAuth.isLogin,adminController.removeBanUser)

admin_route.post('/searchuser',adminLoginAuth.isLogin,adminController.searchUser)

admin_route.get('/add-banner',adminLoginAuth.isLogin,adminController.addBanner)
admin_route.post('/loadBanners',multer.upload.array('bannerImage',3),adminController.addBannerSave)
admin_route.get('/currentBanner',adminLoginAuth.isLogin,adminController.currentBanner)
admin_route.get('/editBanner',adminLoginAuth.isLogin,adminController.editBanner)
admin_route.post('/updateBanner',multer.upload.array('bannerImage',3),adminController.updateBanner)

admin_route.get('/admin-coupon',adminLoginAuth.isLogin,adminController.adminLoadCoupon)
admin_route.post('/admin-coupon',adminLoginAuth.isLogin,adminController.adminStoreCoupon)
admin_route.get('/togglecoupon/:id',adminLoginAuth.isLogin,adminController.deleteCoupon);
admin_route.get('/edit-coupon/:id',adminLoginAuth.isLogin,adminController.editCoupon);
admin_route.post('/updateCoupon',adminController.updateCoupon)

admin_route.get('/filter-category',adminLoginAuth.isLogin,adminController.addFilter)
admin_route.post('/filter-category',adminController.addFilterSave)


admin_route.post("/brands", adminController.updateBrands);
admin_route.post("/brandsDetails", adminController.updateBrandsDetails);
module.exports = admin_route