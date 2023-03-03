const express = require('express')
const category_route = express()

category_route.set('views', './views/admin');
category_route.use(express.static('public'));


const multer = require('../middlewares/multer')
const adminLoginAuth = require('../middlewares/adminLoginAuth');

const categoryController = require('../controllers/categoryController')

category_route.get('/addcategory',adminLoginAuth.isLogin,categoryController.addCategory)
category_route.post('/addcategory',multer.upload.single('image'),categoryController.addCategorySave)

category_route.get('/editCategory/:categoryid',adminLoginAuth.isLogin,categoryController.editCategory)
category_route.post('/updateCategory',multer.upload.single('image'),categoryController.updateCategory)
category_route.get('/togglecategory/:id',adminLoginAuth.isLogin,categoryController.deleteCategory)

category_route.get('/filter-category',adminLoginAuth.isLogin,categoryController.addFilter)
category_route.post('/filter-category',categoryController.addFilterSave)
category_route.get('/edit-filter',adminLoginAuth.isLogin,categoryController.editFilter)
category_route.post('/update-filter',categoryController.updateFilter)
category_route.get('/togglefilter/:id',adminLoginAuth.isLogin,categoryController.deleteFilter)

module.exports = category_route