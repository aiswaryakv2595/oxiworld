const express = require('express')
const admin_route = express()
const cookieParser = require("cookie-parser");

admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))

admin_route.use(cookieParser());

admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin');
admin_route.use(express.static('public'));
admin_route.use(express.static('uploads'));

const session = require('express-session');

const config = require('../config/config')
const oneDay = 1000 * 60 * 60 * 24;
admin_route.use(session({
    secret:config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
}))

const multer = require('multer')

//set storage
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads')
    },
    filename:function(req,file,cb){
        // var ext =file.originalname.substr(file.originalname.lastIndexOf('.'))
        cb(null,file.fieldname+'-'+Date.now()+'-'+file.originalname)
    }
})

var store = multer({storage:storage}).single('images')

admin_route.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

const adminController = require('../controllers/adminController')

const adminLoginAuth = require('../middlewares/adminLoginAuth')

admin_route.get('/admin-setup',adminController.adminSetup)
admin_route.post('/admin-setup',adminController.adminSetupSave)

admin_route.get('/login',adminLoginAuth.isLogout,adminController.loadLogin)
admin_route.post('/login',adminController.verifyLogin)

admin_route.get('/logout',adminLoginAuth.isLogin,adminController.logout)

admin_route.get('/dashboard',adminLoginAuth.authPage(["admin"]) ,adminLoginAuth.isLogin,adminController.dashboard);

admin_route.get('/showusers',adminLoginAuth.isLogin,adminController.showUsers);
//-----------item-------

admin_route.get('/additems',adminLoginAuth.isLogin,adminController.addItems)
admin_route.post('/additems',adminLoginAuth.isLogin,store,adminController.addItemSave)

admin_route.get('/edit_item/:id',adminLoginAuth.isLogin,adminController.editItem);
admin_route.post('/updateitem',store,adminController.updateItem);

admin_route.post('/deleteitem/:id',adminLoginAuth.isLogin,adminController.deleteItem);
//----------end---------
//------category-----
//add category
admin_route.get('/addcategory',adminLoginAuth.isLogin,adminController.addCategory)
admin_route.post('/addcategory',adminLoginAuth.isLogin,store,adminController.addCategorySave)

admin_route.get('/editCategory/:categoryid',adminLoginAuth.isLogin,adminController.editCategory)
admin_route.post('/updateCategory/:categoryid',adminLoginAuth.isLogin,store,adminController.updateCategory)

admin_route.post('/deletecategory/:id',adminLoginAuth.isLogin,adminController.deleteCategory)

//--end category---

admin_route.get('/edituser/:userid',adminLoginAuth.isLogin,adminController.editUser)
admin_route.post('/updateuser',adminLoginAuth.isLogin,adminController.updateUser)

admin_route.post('/deleteuser/:userid',adminLoginAuth.isLogin,store,adminController.deleteUser)

admin_route.post('/searchuser',adminLoginAuth.isLogin,adminController.searchUser)

module.exports = admin_route