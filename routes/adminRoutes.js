const express = require('express')
const admin_route = express()

const Filter = require('../models/filterModel')

admin_route.set('views', './views/admin');
admin_route.use(express.static('public'));

const multer = require('../middlewares/multer')

const adminController = require('../controllers/adminController')

const adminLoginAuth = require('../middlewares/adminLoginAuth');

admin_route.get('/admin-setup',adminController.adminSetup)
admin_route.post('/admin-setup',adminController.adminSetupSave)

admin_route.get('/login',adminLoginAuth.isLogout,adminController.loadLogin)
admin_route.post('/login',adminController.verifyLogin)

admin_route.get('/logout',adminLoginAuth.isLogin,adminController.logout)

admin_route.get('/dashboard',adminController.dashboard);

admin_route.get('/showusers',adminLoginAuth.isLogin,adminController.showUsers);
//-----------item-------

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

admin_route.get('/orders',adminLoginAuth.isLogin,adminController.orders);
admin_route.get('/view-order/:id',adminLoginAuth.isLogin,adminController.viewOrders);
admin_route.post('/cancelOrder',adminController.cancelOrder);
admin_route.post('/change-status',adminController.changeStatus);

//report
admin_route.get('/sales',adminLoginAuth.isLogin,adminController.viewSales);
admin_route.post('/search-orders',adminLoginAuth.isLogin,adminController.getSales);
module.exports = admin_route