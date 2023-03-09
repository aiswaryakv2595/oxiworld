const User = require("../models/userModel");
const Item = require("../models/itemModel");
const Category = require("../models/categoryModel");

const Filter = require("../models/filterModel");
const Review = require("../models/reviewModel");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let userSession;

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

const getFilters = async (req, res) => {
  try {
    const pageSize = 6; // Number of items per page
    const page = req.query.page ? parseInt(req.query.page, 10) : 1; // Current page number

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    let count;
    // Create a new query object to include pagination parameters
    const queryPage = { ...req.query };
    delete queryPage.page;

    const filterType = req.query.filterType;
    let products;
    const material = req.query.material;
    console.log(material);
    count = await Item.countDocuments();
    if (filterType == "high") {
      products = await Item.find({})
        .sort({ price: -1 })
        .skip(startIndex)
        .limit(pageSize);
    } else if (filterType == "low") {
      products = await Item.find({})
        .sort({ price: 1 })
        .skip(startIndex)
        .limit(pageSize);
    } else if (filterType == "material") {
      products = await Item.find({ material: material })
        .skip(startIndex)
        .limit(pageSize);
      count = await Item.countDocuments({ material: material });
    }

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
      totalItems: count,
    };
    res.json({ products: products, pagination: pagination });
  } catch (error) {
    console.log(error.message);
  }
};
const filterCollections = async (req, res) => {
  try {
    const materialtype = req.query.materialtype;
    const material = req.query.material;
    const category_id = req.query.category;
    const search = req.query.search;

    const categories = await Category.find({});

    const filters = await Filter.find({});

    let brands = [];

    let colorArray = [];
    let sizeArray = [];

    filters.forEach((filter) => {
      brands = brands.concat(filter.filter.brand);
    });

    brands = brands.filter((brand, index, self) => {
      return index === self.findIndex((b) => b.name === brand.name);
    });
    brands.forEach((brand) => {
      brand.color.forEach((color) => {
        if (!colorArray.includes(color)) {
          colorArray.push(color);
        }
      });
      brand.size.forEach((size) => {
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
        { name: { $regex: ".*" + search + ".*" } },
      ],
    });
    const allProducts = await Item.find({});
    console.log(products);

    const userData = await User.findById({ _id: req.session.user_id });
    res.status(200).render("collections", {
      categories: categories,
      user: userData,
      products: products,
      allProducts: allProducts,
      filter: brands,
      size: sizeArray,
      color: colorArray,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const searchItems = async (req, res) => {
  const search = req.body.search;
  const materialtype = req.query.materialtype;
  const material = req.query.material;
  const category_id = req.query.category;

  const categories = await Category.find({});

  const filters = await Filter.find({});
  console.log(search);

  const Data = await Item.find({ name: { $regex: ".*" + search + ".*" } });

  if (Data.length > 0) {
    res.render("/collection", { user: userData });
  } else {
    res.status(200).send("product not found");
  }
};

const searchCategory = async (req, res) => {
  try {
    const pageSize = 6; // Number of items per page
    const page = req.query.page ? parseInt(req.query.page, 10) : 1; // Current page number

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    let count;
    // Create a new query object to include pagination parameters
    const queryPage = { ...req.query };
    delete queryPage.page;
    const categoryId = req.body.categoryId;
    console.log("categoryId " + categoryId);
    let products;
    let filters;
    if (categoryId) {
      products = await Item.find({ category_id: categoryId })

        .skip(startIndex)
        .limit(pageSize);
      count = await Item.countDocuments({ category_id: categoryId });
      filters = await Filter.find({ categoryId: categoryId });
    } else {
      products = await Item.find({});
      count = await Item.countDocuments();
      filters = await Filter.find({});
    }

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
      totalItems: count,
    };

    res.json({ products: products, filters: filters, pagination: pagination });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
};

const searchBrand = async (req, res) => {
  try {
    const selectedBrands = req.body.brands; // array of selected brands
    const categoryId = req.body.categoryId;
    // console.log(selectedBrands);
    const pageSize = 6; // Number of items per page
    const page = req.query.page ? parseInt(req.query.page, 10) : 1; // Current page number

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    let count;
    let products;

    const filter = await Filter.find({ brand: { $in: selectedBrands } }); // find filters for selected brands
    console.log(filter);

    const filterIds = filter.map((f) => f._id); // get the filter ids
    if (categoryId) {
      if (selectedBrands) {
        products = await Item.find({
          brand_id: { $in: filterIds },
          category_id: categoryId,
        })
          .skip(startIndex)
          .limit(pageSize); // find items for the selected brands
        count = await Item.countDocuments({
          brand_id: { $in: filterIds },
          category_id: categoryId,
        });
      } else
        products = await Item.find({ category_id: categoryId })
          .skip(startIndex)
          .limit(pageSize);
      count = await Item.countDocuments({ category_id: categoryId });
    } else if(selectedBrands){
      products = await Item.find({
        brand_id: { $in: filterIds },
      })
        .skip(startIndex)
        .limit(pageSize);
      count = await Item.countDocuments({
        brand_id: { $in: filterIds },
      });
    }
    else{
      products = await Item.find({})
        .skip(startIndex)
        .limit(pageSize);
      count = await Item.countDocuments({});
    }
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

const searchColor = async (req, res) => {
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

    const color = req.body.color;
    const products = await Item.find({ color: { $in: color } })
      .skip(startIndex)
      .limit(pageSize);
    count = await Item.countDocuments({ color: { $in: color } });

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
const searchProducts = async (req, res) => {
  const query = req.body.search;
  const pageSize = 6; // Number of items per page
  const page = req.query.page ? parseInt(req.query.page, 10) : 1; // Current page number

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  let count;
  // Create a new query object to include pagination parameters
  const queryPage = { ...req.query };
  delete queryPage.page;
  console.log(query);
  const products = await Item.find({
    name: { $regex: query, $options: "i" },
  })
    .populate("category_id")
    .skip(startIndex)
    .limit(pageSize);
  count = await Item.countDocuments({
    name: { $regex: query, $options: "i" },
  });
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(count / pageSize),
    totalItems: count,
  };
  // console.log(products);
  res.json({ products: products, pagination: pagination });
};
module.exports = {
  productDetails,
  getFilters,
  filterCollections,
  searchItems,
  searchCategory,
  searchBrand,
  searchColor,
  searchPrice,
  searchProducts,
};
