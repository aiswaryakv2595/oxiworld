const User = require("../models/userModel");
const Item = require("../models/itemModel");
const Category = require("../models/categoryModel");
const mongoose = require("mongoose");

const Filter = require("../models/filterModel");
const Review = require("../models/reviewModel");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let userSession;

const showCollections = async (req, res, next) => {
  try {
    const pageSize = 6; // Number of items per page
    const page = req.query.page ? parseInt(req.query.page, 10) : 1; // Current page number

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    // Create a new query object to include pagination parameters
    const queryPage = { ...req.query };
    delete queryPage.page;
    ///check
    const filterType = req.query.filterType;
    const category_id =  req.query.category;
   
    const brandsString = req.query.brand;
    const brandsArray = brandsString ? brandsString.split(","): [];

    const colorsString = req.query.color;
    const colorsArray = colorsString ? colorsString.split(","): [];

    const material = req.query.material;

   
    const ajax = req.query.ajax;

    let query = {};
    let filter;
    let filterIds;
    let filterData;
    ///

    const categories = await Category.find({});
    const filters = await Filter.find({});
    // const categoryId = req.query.categoryId;
    // const brands = req.query.brands || [];



    // Add category filter to Item.find() query
    // const query = categoryId ? { category_id: categoryId } : {};
    // if (brands.length) {
    //   query.brand = { $in: brands };
    // }
    
    if (category_id && category_id != 'undefined') {
     
      query.category_id = category_id;
    }

    if (brandsArray.length > 0 ) {
      filter = await Filter.find({ brand: { $in: brandsArray } });
      filterIds = filter.map((f) => f._id);
      query.brand_id = { $in: filterIds };
    }

    if (colorsArray.length > 0)
      query.color = { $in: colorsArray };

    if (material && material!= 'undefined') query.material = material;
    if (filterType == 'search'){
      const search = req.query.search;
      query.name = { $regex: search, $options: "i" };
    } 



console.log('query',query);
if(!filterType)
sortOrder = 0
 sortOrder = filterType === "high" ? -1 : 1;
 console.log('sort',sortOrder);
    const products = await Item.find(query)
      .populate("brand_id")
      .populate("category_id")
      .sort({price:sortOrder})
      .skip(startIndex)
      .limit(pageSize);
      // console.log(products);
    const count = await Item.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
      totalItems: count,
    };
    const userData = await User.findById({ _id: req.session.user_id });

    const uniqueBrands = getUniqueValues(filters, "brand");
    const uniqueColors = getUniqueValues(products, "color");
    const uniqueMaterials = getUniqueValues(products, "material");
    

    res.locals.categories = categories;
    res.locals.user = userData;
    res.locals.products = products;
    res.locals.uniqueBrands = uniqueBrands;
    res.locals.uniqueColors = uniqueColors;
    res.locals.uniqueMaterials = uniqueMaterials;
   
if(ajax){
  res.json({
    products: products,
    pagination: pagination,
    filter: filterData,
  });
}
    else
    res.status(200).render("collections", { pagination });
  } catch (err) {
    next(err);
  }
};

function getUniqueValues(filters, fieldName) {
  const values = new Set();

  for (const filter of filters) {
    const fieldValue = filter[fieldName];
    if (Array.isArray(fieldValue)) {
      fieldValue.forEach((value) => values.add(value));
    } else {
      values.add(fieldValue);
    }
  }

  return Array.from(values);
}


const productDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const userData = await User.findOne({ _id: req.session.user_id });
    const allCategories = await Category.find({});
    const allProducts = await Item.find({}).populate("category_id", "brand_id");

    const productDetail = await Item.findById({ _id: id }).populate(
      "category_id",
      "brand_id"
    );

    const filters = await Filter.findById({ _id: productDetail.brand_id });

    const review = await Review.find({ productId: id }).populate("userId");
    const reviewCount = await Review.countDocuments({ productId: id });

    res.status(200).render("productdetails", {
      product: productDetail,
      user: userData,
      allitems: allProducts,
      allcate: allCategories,
      filter: filters,
      review: review,
      count: reviewCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const searchPrice = async (req, res) => {
  try {
    const query = req.body.search;
    const pageSize = 6; // Number of items per page
    const page = req.query.page ? parseInt(req.query.page, 10) : 1; // Current page number

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    let count;
    // Create a new query object to include pagination parameters
    const queryPage = { ...req.query };
    delete queryPage.page;

    const minPrice = req.body.min || 0;
    const maxPrice = req.body.max || 999999;
    const products = await Item.find({
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .populate("category_id")
      .skip(startIndex)
      .limit(pageSize);
    count = await Item.countDocuments({
      price: { $gte: minPrice, $lte: maxPrice },
    });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
      totalItems: count,
    };
    res.json({ products: products, pagination: pagination });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
};

module.exports = {
  showCollections,
  productDetails,

  searchPrice,
  getUniqueValues
};
