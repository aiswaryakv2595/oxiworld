const Item = require("../models/itemModel");
const Category = require("../models/categoryModel");
const Filter = require('../models/filterModel')
const fs = require("fs");
const path = require("path");

const addItems = async (req, res) => {
  try {
    var page = 1;
    if(req.query.page){
      page = req.query.page
    }
    const limit = 6
    const category = await Category.find({});
    const itemData = await Item.find({})
      .populate('category_id')
      .limit(limit*1)
      .skip((page-1)*limit)
      .exec()
      const count = await Item.countDocuments()
    console.log(itemData);
    let totalPages = Math.ceil(count/limit)
    console.log(count);
    if(page<=0){
      prev = 1
    }
    else
   prev = page-1

   next = parseInt(page)+1
    // if (req.xhr) {
    //   res.render('addItems', { item: itemData }); // render only the table template
    // } else {
      res.render('addItems', { 
        item: itemData,
        categories: category,
        totalPages:Math.ceil(count/limit),
        currentPage:page,
        next:next,
        prev:prev
      });
    // }
  } catch (error) {
    console.log(error.message);
  }
};

  
  const updateBrands = async (req, res) => {
    try {
      const brandId = req.query.brandId;
      const filters = await Filter.find({ _id: brandId });
  
      // Extract the materials and material types from the filters array
      const materials = filters.map(filter => filter.material);
      const materialTypes = filters.map(filter => filter.material_type);
      const colors = filters.map(filter => filter.color);
  
      res.json({ materials: materials, materialTypes: materialTypes,colors:colors });
    } catch (error) {
      console.log(error);
      res.status(500).send('Server error');
    }
  };
  
  //select brand items
  const getFilters = async (req, res) => {
    try {
      const filters = await Filter.find({ categoryId: req.query.categoryId });
      console.log('filter')
      console.log(filters);
      res.json({ filters: filters });
    } catch (error) {
      console.log(error);
      res.status(500).send('Error retrieving filters');
    }
  };
  const addItemSave = async (req, res, next) => {
    try {
      const name = req.body.name;
      const model_number = req.body.model_number;
      const category_id = req.body.category;
      const price = req.body.price;
      const description = req.body.description;
      const brand = req.body.brand_id;
      const material = req.body.material;
      const material_type = req.body.material_type;
      const color = req.body.color;
      const a = req.files;
  
      const item = new Item({
        name: name,
        model_number: model_number,
        description: description,
        category_id: category_id,
        price: price,
        brand_id: brand,
        color:color,
        stock:req.body.stock,
        material:material,
        material_type:material_type,
        images: a.map((x) => x.filename),
      });
      console.log(brand);
      
      const userData = await item.save();
      if (userData) {
        res.status(201).redirect("/admin/additems");
      } else {
        res.status(404);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const editItem = async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.find({});
      const itemData = await Item.findById({ _id: id }).populate("category_id");
      const filters = await Filter.find({_id:itemData.brand_id,categoryId:itemData.category_id});
     
      if (itemData) {
        res.status(200).render("editItem", { item: itemData, category: category,filter:filters });
      } else {
        res.redirect("admin/additems");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
const updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const model_number = req.body.model_number;
    const category_id = req.body.category;
    const price = req.body.price;
    const description = req.body.description;
    const brand_id = req.body.brand_id;

    // Get the list of old images from the hidden input field
    const old_images = req.body.old_images.split(",");

    // Check if new images were uploaded
    let images = old_images;
    if (req.files && req.files.length > 0) {
      // Map the array of new images to get just the filenames
      const new_images = req.files.map((file) => file.filename);

      // Combine the old and new images
      images = [...old_images, ...new_images];
    }

    // Update the item with the new images
    const item = await Item.findByIdAndUpdate(id, {
      $set: {
        name: name,
        model_number: model_number,
        category_id: category_id,
        stock:req.body.stock,
        price: price,
        description: description,
        brand_id: brand_id,
        color:req.body.color,
        material: req.body.material,
        material_type: req.body.material_type,
        images: images,
      },
    });

    if (item) {
      
      const removed_images = old_images.filter((image) => !images.includes(image));
      for (let i = 0; i < removed_images.length; i++) {
        fs.unlinkSync(`./public/products/${removed_images[i]}`);
      }
      res.redirect("/admin/additems");
    } else {
      res.render("editItem", { message: "Something went wrong!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
}
  
  const deleteImage = async (req, res) => {
    try {
      const itemId = req.params.itemId;
      const imageName = req.params.imageName;
  
      await Item.findByIdAndUpdate(itemId, {
        $pull: { images: imageName }
      },{ new: true });
  
      fs.unlinkSync(`./public/products/${imageName}`);
  
      res.json({ success: true });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false });
    }
  };
  
  const deleteItem = async (req, res) => {
    try {
      let id = req.params.id;
      var page = 1;
    if(req.query.page){
      page = req.query.page
    }
      let userData;
      let limit =2
    const toggleActive = await Item.findById({_id:id}).limit(limit*1)
    .skip((page-1)*limit)
    .exec()
    if(toggleActive.is_available == true){
       userData = await Item.findByIdAndUpdate(
        { _id: id },
        { $set: { is_available: false } }
      );
    }
    else{
       userData = await Item.findByIdAndUpdate(
        { _id: id },
        { $set: { is_available: true } }
      );
    }
      
  
      if (userData) res.redirect("/admin/additems?page="+page);
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const showItem = async (req, res) => {
    try {
      let id = req.params.id;
      const userData = await Item.findByIdAndUpdate(
        { _id: id },
        { $set: { is_available: true } }
      );
      if (userData) res.redirect("/admin/additems");
    } catch (error) {}
  };

  module.exports = {
    addItems,
    updateBrands,
    getFilters,
    addItemSave,
    editItem,
    updateItem,
    deleteImage,
    deleteItem,
    showItem
  }
  