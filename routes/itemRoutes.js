const express = require('express')
const item_route = express()

item_route.set('views', './views/admin');
item_route.use(express.static('public'));

const adminItemController = require('../controllers/adminItemController')
const adminLoginAuth = require('../middlewares/adminLoginAuth');

const multer = require('../middlewares/multer')
item_route.get('/additems',adminLoginAuth.isLogin,adminItemController.addItems)


item_route.post('/additems',multer.upload.array('images',3),adminItemController.addItemSave)

item_route.get('/edit_item/:id',adminLoginAuth.isLogin,adminItemController.editItem);
item_route.post('/updateitem/:id',multer.upload.array('images',3),adminItemController.updateItem);

item_route.get('/toggleitem/:id',adminLoginAuth.isLogin,adminItemController.deleteItem);

// item_route.get('/delete-image',adminLoginAuth.isLogin,adminItemController.deleteItemImage);
item_route.delete('/delete-image/:itemId/:imageName', adminItemController.deleteImage);

item_route.get("/brandsDetails", adminItemController.updateBrands);
item_route.get('/getFilters', adminItemController.getFilters);

// products.js (or whatever your file name is)

  

module.exports = item_route