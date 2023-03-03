const User = require("../models/userModel");
const Item = require("../models/itemModel");
const Category = require("../models/categoryModel");

const Filter = require('../models/filterModel')
const Review = require('../models/reviewModel')
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let userSession;

const productDetails = async(req,res)=>{
  try {
      const id = req.params.id;
      const userData = await User.findOne({_id:req.session.user_id})
      const allCategories = await Category.find({});
      const allProducts = await Item.find({}).populate('category_id','brand_id');

      const productDetail = await Item.findById({_id: id}).populate('category_id','brand_id');
      
      const filters = await Filter.findById({_id:productDetail.brand_id})

      const review = await Review.find({productId:id}).populate('userId');
      const reviewCount = await Review.countDocuments({productId:id});
    
    
      res.status(200).render('productdetails',{
          product:productDetail,
          user:userData,
          allitems:allProducts,
          allcate:allCategories,
          filter:filters,
          review:review,
          count:reviewCount
      })

      
  } catch (error) {
      console.log(error.message);
      
  }

}


const sortAscending = async(req,res)=>{
    try {
      
  const products = await Item.find({}).sort({ price: 1 })
  res.json(products);
    } catch (error) {
      console.log(error.message);
    }
     
  }
  const sortDescending = async(req,res)=>{
    try {
  
  const products = await Item.find({}).sort({ price: -1 })
      
  res.json(products);
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

// const searchCategory = async (req, res) => {
//   try {
//     const categoryId = req.query.categoryId;
   
//     const products = await Item.find({ category_id: categoryId });
//     let filters;
//     if(categoryId != 1)
//      filters = await Filter.find({categoryId:categoryId})
//      else
//      filters = await Filter.find({})
//     console.log(products);
//     res.json({products,filters});
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).send('Error fetching products');
//   }
// };
const searchCategory = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    const products = await Item.find({ category_id: categoryId });
    const filters = await Filter.find({ categoryId: categoryId });
    res.json({ products: products, filters: filters });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
};

const searchBrand = async (req, res) => {
  try {
    const selectedBrands = req.body.brands; // array of selected brands
    const categoryId = req.body.categoryId; 
    console.log(selectedBrands);
    let products;

    const filter = await Filter.find({ brand: { $in: selectedBrands } }); // find filters for selected brands
    console.log(filter);

    const filterIds = filter.map((f) => f._id); // get the filter ids
    if(categoryId)
     products = await Item.find({ brand_id: { $in: filterIds },category_id:categoryId }); // find items for the selected brands
     else
     products = await Item.find({ brand_id: { $in: filterIds } });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
};


const searchColor = async (req, res) => {
  try {
   const color = req.params.color
   
    const products = await Item.find({ color: color });
    console.log('products'+products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
};

const searchMaterial = async (req, res) => {
  try {
   const material = req.params.material
   
    const products = await Item.find({ material: material });
   
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
};
const searchPrice = async (req, res) => {
  try {
    const minPrice = req.body.min || 0;
    const maxPrice = req.body.max || 999999;
    const products = await Item.find({ price: { $gte: minPrice, $lte: maxPrice } }).populate('category_id');

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
};
const searchProducts = async(req,res)=>{
  const query = req.body.search;
  console.log(query);
  const products = await Item.find({ name: { $regex: query, $options: 'i' } }).populate('category_id');
  console.log(products);
  res.json(products);
}
  module.exports = {
    productDetails,
    sortAscending,
    sortDescending,
    filterCollections,
    searchItems,
    searchCategory,
    searchBrand,
    searchColor,
    searchMaterial,
    searchPrice,
    searchProducts
  }