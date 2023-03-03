
const { findByIdAndUpdate } = require("../models/categoryModel");
const Category = require("../models/categoryModel");
const Filter = require('../models/filterModel')

const addCategory = async (req, res) => {
    try {
      const categoryData = await Category.find({});
      res.render("addCategory", { category: categoryData });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const addCategorySave = async (req, res, next) => {
    try {
      const name = req.body.name;
  
      console.log(req.file);
  
      const category = new Category({
        name: name,
        images: req.file.filename,
      });
     
  
      const categoryData = await category.save();
      if (categoryData) {
        res.redirect("/admin/addcategory");
      } else {
        res.redirect("/admin/addcategory");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const editCategory = async (req, res) => {
    try {
      const catId = req.params.categoryid;
  
      const catData = await Category.findById({ _id: catId });
  
      if (catData) {
        res.render("editCategory", { category: catData });
      } else {
        res.redirect("/admin/addcategory");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const updateCategory = async (req, res) => {
    try {
      const catid = req.body.catid;
      let new_image ="";
  
      const name = req.body.name;
  
      if(req.file){
          new_image = req.file.filename;
        fs.unlinkSync('./public/uploads/'+ req.body.old_image)
  
      }
      else{
          new_image = req.body.old_image
      }
  
      const categoryData =await Category.findByIdAndUpdate({_id:catid},{$set:{name:name,images:new_image}})
     console.log(categoryData);
     if (categoryData) {
  
      res.redirect('/admin/addcategory')
     }
     else{
      res.render('editCategory',{message:'something went wrong!!!'})
     }
      
  } catch (error) {
      console.log(error.message);
  }
  };

  const deleteCategory = async (req, res) => {
    try {
      let id = req.params.id;
      let userData;
      const toggleActive = await Category.findById({_id:id});
      if(toggleActive.is_available == true){
        userData = await Category.findByIdAndUpdate(
          { _id: id },
          { $set: { is_available: false } }
        );
      } else {
        userData = await Category.findByIdAndUpdate(
          { _id: id },
          { $set: { is_available: true } }
        );
      }
  
      if (userData) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ success: false, message: "Failed to update category." });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  const addFilter = async(req,res)=>{
    try {
     const category = await Category.find({})
      const filter = await Filter.find({}).populate('categoryId')
      res.status(200).render('add-filter',{filter:filter,category:category})
      
    } catch (error) {
      console.log(error.message);
      
    }
  }
  
  const addFilterSave = async(req,res)=>{
    try {
      const brand = req.body.brand
    const categoryId = req.body.categoryId
     const filter = new Filter({
      categoryId:categoryId,
      brand:brand,
      size:req.body.size.map((x)=>x),
      color:req.body.color.map((x)=>x),
      material:req.body.material.map((x)=>x),
      material_type:req.body.material_type.map((x)=>x)
     })
     const filterData = await filter.save()
     if(filterData)
      res.status(200).redirect('/admin/filter-category')
      
    } catch (error) {
      console.log(error.message);
      
    }
  
  }
 
  const editFilter = async(req,res)=>{
    const id = req.query.id;
    const filterData = await Filter.findById({_id:id});
    if (filterData) {
      res.status(200).render('edit-filter',{filter:filterData})
      
    } else {
      res.status(500).json({ success: false, message: "Failed." });
    }
  }

  const updateFilter = async(req,res)=>{
    const id = req.body.id;
    const filter = await Filter.findById({_id:id});
   
if (!filter) {
  return res.status(404).send('Filter not found');
}

// res.send(arr)

 const updatedFilter = await Filter.findByIdAndUpdate({_id:id},{
  $set:{
    brand:req.body.brand,
    size:req.body.size.map(x=>x),
    color:req.body.color.map(x=>x),
    material:req.body.material.map(x=>x),
    material_type:req.body.material_type.map(x=>x)
  }
 })
 console.log(updatedFilter);
    if(updatedFilter){
      console.log(updateFilter);
      res.status(200).redirect('/admin/filter-category')
    }
    else{
      res.status(500).render('edit-filter',{message:'Something went wrong'})
    }
  }
  const deleteFilter = async (req, res) => {
    try {
      let id = req.params.id;
      let userData;
      const toggleActive = await Filter.findById({_id:id});
      if(toggleActive.is_available == true){
        userData = await Filter.findByIdAndUpdate(
          { _id: id },
          { $set: { is_available: false } }
        );
      } else {
        userData = await Filter.findByIdAndUpdate(
          { _id: id },
          { $set: { is_available: true } }
        );
      }
  
      if (userData) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ success: false, message: "Failed to update filter." });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  module.exports = {
    addCategory,
    addCategorySave,
    editCategory,
    updateCategory,
    addFilter,
    addFilterSave,
    deleteCategory,
    deleteFilter,
    editFilter,
    updateFilter
  }
  