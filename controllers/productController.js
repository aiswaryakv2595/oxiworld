const User = require("../models/userModel");
const Item = require("../models/itemModel");
const Category = require("../models/categoryModel");

const Filter = require('../models/filterModel')
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let userSession;
const categorySelect = async(id)=>{
  const category = await Category.findById({_id:id});
  return category
}
const sortAscending = async(req,res)=>{
    try {
      const materialtype = req.query.materialtype;
      const material = req.query.material;
  
      const categories = await Category.find({})
    
      const filters = await Filter.find({})
      let brands = [];
  
      let colorArray = [];
      let sizeArray = [];
  
      filters.forEach(filter => {
          brands = brands.concat(filter.filter.brand);
        });
        
        brands = brands.filter((brand, index, self) => {
          return index === self.findIndex(b => b.name === brand.name);
        });
        brands.forEach(brand => {
          brand.color.forEach(color => {
          if (!colorArray.includes(color)) {
          colorArray.push(color);
          }
          });
          brand.size.forEach(size => {
          if (!sizeArray.includes(size)) {
          sizeArray.push(size);
          }
          });
          });
        
     
  const products = await Item.find({}).sort({ price: 1 })
      const allProducts = await Item.find({})
      const userData = await User.findById({_id:req.session.user_id})
    res.render('collections',{
      categories:categories,
      user:userData,
      products:products,
      allProducts:allProducts,
      filter:brands,
      size:sizeArray,
      color:colorArray
    });
      
    } catch (error) {
      console.log(error.message);
    }
     
  }
  const sortDescending = async(req,res)=>{
    try {
      const materialtype = req.query.materialtype;
      const material = req.query.material;
  
      const categories = await Category.find({})
    
      const filters = await Filter.find({})
      let brands = [];
  
      let colorArray = [];
      let sizeArray = [];
  
      filters.forEach(filter => {
          brands = brands.concat(filter.filter.brand);
        });
        
        brands = brands.filter((brand, index, self) => {
          return index === self.findIndex(b => b.name === brand.name);
        });
        brands.forEach(brand => {
          brand.color.forEach(color => {
          if (!colorArray.includes(color)) {
          colorArray.push(color);
          }
          });
          brand.size.forEach(size => {
          if (!sizeArray.includes(size)) {
          sizeArray.push(size);
          }
          });
          });
        
     
  const products = await Item.find({}).sort({ price: -1 })
      const allProducts = await Item.find({})
      const userData = await User.findById({_id:req.session.user_id})
    res.render('collections',{
      categories:categories,
      user:userData,
      products:products,
      allProducts:allProducts,
      filter:brands,
      size:sizeArray,
      color:colorArray
    });
      
    } catch (error) {
      console.log(error.message);
    }
     
  }
  const filterCollections = async(req,res)=>{
    try {
      const materialtype = req.query.materialtype;
      const material = req.query.material;
      const category_id = req.query.category
      const search = req.query.search
  
      const categories = await Category.find({})
    
      const filters = await Filter.find({})
  
      //filter
      // const brandIds = await Filter.find({ 'filter.brand.name': { $in: [b_name] } }, 'filter.brand._id')
      
  // console.log("filter"+brandIds);
      let brands = [];
  
      let colorArray = [];
      let sizeArray = [];
  
      filters.forEach(filter => {
          brands = brands.concat(filter.filter.brand);
        });
        
        brands = brands.filter((brand, index, self) => {
          return index === self.findIndex(b => b.name === brand.name);
        });
        brands.forEach(brand => {
          brand.color.forEach(color => {
          if (!colorArray.includes(color)) {
          colorArray.push(color);
          }
          });
          brand.size.forEach(size => {
          if (!sizeArray.includes(size)) {
          sizeArray.push(size);
          }
          });
          });
        
     
          const products = await Item.find({
              $or: [
                { material_type: materialtype },
                { material: material },
                { category_id: category_id },
                {name:{$regex:".*"+search+".*"}}
              ]
            });
      const allProducts = await Item.find({})
  console.log(products);
  
      const userData = await User.findById({_id:req.session.user_id})
    res.status(200).render('collections',{
      categories:categories,
      user:userData,
      products:products,
      allProducts:allProducts,
      filter:brands,
      size:sizeArray,
      color:colorArray
    });
      
    } catch (error) {
      console.log(error.message);
    }
     
  }
  

  const searchItems = async(req,res) =>{
    const search = req.body.search;
    const materialtype = req.query.materialtype;
      const material = req.query.material;
      const category_id = req.query.category
  
      const categories = await Category.find({})
    
      const filters = await Filter.find({})
    console.log(search);

    const Data = await Item.find({name:{$regex:".*"+search+".*"}})
   
    if(Data.length >0){
        res.render('/collection',{user:userData})
    }
    else{
        res.status(200).send('product not found')
    }
}
  module.exports = {
    sortAscending,
    sortDescending,
    filterCollections,
    searchItems
  }