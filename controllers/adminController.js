const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Item = require("../models/itemModel");
const Category = require("../models/categoryModel");
const Banner = require('../models/bannerModel')
const Coupon = require('../models/couponModel')
const Filter = require('../models/filterModel')
const fs = require("fs");
const path = require("path");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const adminSetup = async (req, res) => {
  try {
    var user = await Admin.find({});
    if (user.length > 0) {
      res.redirect("/admin/login");
    } else {
      res.render("adminSetup");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminSetupSave = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const user = new Admin({
      name: name,
      email: email,
      password: password,
      role: "admin",
    });

    const userData = await user.save();
    if (userData) {
      res.status(201).redirect("/admin/login");
    } else {
      res.render("adminSetup", { message: "Admin Setup failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.status(200).render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await Admin.findOne({ email: email });

    //   console.log(userData);

    if (userData) {
      if (userData.password == password) {
        req.session.user_id = userData._id;
        req.session.role = userData.role;
        res.status(200).redirect("/admin/dashboard");
      } else {
        res.render("login", { message: "Email or Pasword is incorrect" });
      }
    } else {
      res.render("login", { message: "Login Failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const dashboard = async (req, res) => {
  try {
    const userData = await Admin.findOne({ _id: req.session.user_id });
    res.status(200).render("dashboard", { user: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("error");
      } else {
        res.status(200).redirect("/admin/login");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const showUsers = async (req, res) => {
  try {
    const userData = await User.find({});
    res.render("show-users", { user: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const addItems = async (req, res) => {
  try {
    const category = await Category.find({});
    const itemData = await Item.find({}).populate('category_id');
    const selectedCategory = category[0]._id;
    const filterData = await Filter.find({categoryId: selectedCategory})

    res.status(200).render("addItems", { item: itemData,
     category: category,
    filter:filterData });
  } catch (error) {
    console.log(error.message);
  }
};

const updateBrands = async (req, res) => {
  try {
    const selectedCategory = req.body.category;
    const brands = await Filter.find({ categoryId: selectedCategory });
    const filteredBrands = brands
    .map(brand => brand.filter.brand)
    .flat()
    .map(brand => brand);

  // console.log(filteredBrands);
  res.json(filteredBrands);
   
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

//select brand items
const updateBrandsDetails = async (req, res) => {
  try {
    const selectedBrand = req.body.brand_id;
    const brands = await Filter.find({ "filter.brand._id": selectedBrand });
    const filteredBrands = brands
    .map(brand => brand.filter.brand)
    .flat()
    .map(brand => brand);

  console.log(brands);
  res.json(filteredBrands);
   
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
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
    const a = req.files;

    const item = new Item({
      name: name,
      model_number: model_number,
      description: description,
      category_id: category_id,
      price: price,
      brand_id: brand,
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
    const filters = await Filter.find({categoryId:itemData.category_id});
    
    console.log(filters);
    let brands = [];
    filters.forEach(filter => {
      brands = brands.concat(filter.filter.brand);
    });
    console.log(brands);

    if (itemData) {
      res.status(200).render("editItem", { item: itemData, category: category,filter:brands });
    } else {
      res.redirect("admin/additems");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateItem = async (req, res) => {
  try {
    const id = req.params.id
    const name = req.body.name;
    const model_number = req.body.model_number;
    const category_id = req.body.category;
    const price = req.body.price;
    const description = req.body.description;
    
    const brand_id = req.body.brand_id;
    let new_image = []
    const old_image = req.body.old_image
    let itemData;
   
   console.log(old_image);
    const a = req.files;
    if(a){
      new_image = a.map((x) => x.filename)
      // fs.unlinkSync('./public/products/'+ req.body.old_image)
       itemData =await Item.findByIdAndUpdate({_id:id},{
        $set:{
          name:name,
          model_number:model_number,
          category_id:category_id,
          price:price,
          description:description,
          size:size,
          material:material,
          material_type:material_type,
          brand:brand,
          images:new_image
        }})
    }
    else{
       itemData =await Item.findByIdAndUpdate({_id:id},{
        $set:{
          name:name,
          model_number:model_number,
          category_id:category_id,
          price:price,
          description:description,
          size:size,
          material:material,
          material_type:material_type,
          brand:brand,
          images:old_image
        }
      })
  }
 

    if (itemData) {

      res.redirect('/admin/additems')
     }
     else{
      res.render('editItem',{message:'something went wrong!!!'})
     }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteItemImage = async(req,res)=>{
try {
  const id = req.query.id;
  const image = req.query.image;
  const itemImage = await Item.findByIdAndDelete(
    { _id: id },
    { "images.name":image },
  )
  if(itemImage)
  res.status(200).redirect('/admin/edit_item/'+id)
  
} catch (error) {
  console.log(error.message);
  
}
}

const deleteItem = async (req, res) => {
  try {
    let id = req.params.id;
    let userData;
  const toggleActive = await Item.findById({_id:id});
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
    

    if (userData) res.redirect("/admin/additems");
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
// add category
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
  }
  else{
     userData = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { is_available: true } }
    );
  }
    

    if (userData) res.redirect("/admin/addcategory");
  } catch (error) {
    console.log(error.message);
  }
};

//end
const editUser = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userData = await User.findOne({ _id: userId });

    if (userData) {
      res.render("edituserView.ejs", { user: userData });
    } else {
      res.redirect("/admin/showusers");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.body.id;
    const name = req.body.name;
    const email = req.body.email;
    console.log(req.body.password);
    const password = await securePassword(req.body.password);
    console.log(password);
    const phone = req.body.phone;
    const gender = req.body.gender;

    const userData = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          name: name,
          email: email,
          password: password,
          phone: phone,
          gender: gender,
        },
      }
    );
    //    console.log(userData);
    if (userData) {
      res.redirect("/admin/showusers");
    } else {
      res.render("editUserView", { message: "something went wrong!!!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const banUser = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userData = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { is_active: 0 } }
    );
    console.log(userData);
    if (userData) {
      console.log("success");
    } else {
      console.log("failed");
    }
    res.redirect("/admin/showusers");
  } catch (error) {
    console.log(error.message);
  }
};

const removeBanUser = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userData = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { is_active: 1 } }
    );
    console.log(userData);
    if (userData) {
      console.log("success");
    } else {
      console.log("failed");
    }
    res.redirect("/admin/showusers");
  } catch (error) {
    console.log(error.message);
  }
};

const searchUser = async (req, res) => {
  const search = req.body.search;
  console.log(search);

  const userData = await User.find({ name: { $regex: ".*" + search + ".*" } });
  console.log(userData);
  if (userData.length > 0) {
    res.render("show-users", { user: userData });
  } else {
    res.status(200).send("product not found");
  }
};

const addBanner = async(req,res)=>{
  try {
    const banner = await Banner.find({})
    console.log(banner);
    res.render('add-banner',{banner:banner});
    
  } catch (error) {
    console.log(error.message);
  }
}

const addBannerSave = async(req,res)=>{
  try {
    const newBanner = req.body.banner;
   
    const a = req.files;
    // console.log(req.files);
    const banner = new Banner({
      banner: newBanner,
      bannerImage: a.map((x) => x.filename),
    });
    banner.content.heading.push({
      head_1:req.body.head_1,
      head_2:req.body.head_2,
      sub_head:req.body.sub_head,
  })
    const bannerData = await banner.save();

    if (bannerData) {
      res.redirect("/admin/add-banner");
    }
    
  } catch (error) {
    
  }
}

const currentBanner = async(req,res)=>{
try {
  const id = req.query.id;

  await Banner.findOneAndUpdate({ is_active: 1 }, { $set: { is_active: 0 } });
  await Banner.findByIdAndUpdate({ _id: id }, { $set: { is_active: 1 } });
  res.redirect("/admin/add-banner");
} catch (error) {
  console.log(error.message);
}
}

const editBanner = async(req,res)=>{
  try {
    const id = req.query.id;
    const banner = await Banner.findById({_id:id})
    const bannerImage = banner.bannerImage.map((x)=>x)
    let content = banner.content.heading.map(x=>x).flat()
    console.log(content);

    if (banner) {
      res.status(200).render('edit-banner',{
        banner:banner,
        bannerImage:bannerImage,
        content:content
      })
      
    } else {
      res.status(404).render('edit-banner',{message:'Something went wrong'})
    }
    
  } catch (error) {
    console.log(error.message);
  }

}

const updateBanner = async(req,res)=>{
  try {
    const id = req.body.id;
    const a = req.files;
    const old_image = req.body.old_image
    
    console.log(old_image);

    let bannerImage;
    if(a){
      bannerImage = a.map((x) => x.filename)
    }
    else{
      bannerImage = old_image.map(x=>x)
    }
    const banner = await Banner.findByIdAndUpdate({_id:id},{$set:{
      banner:req.body.banner,
      bannerImage:bannerImage,
      "content.heading[0].head_1":req.body.head_1,
      "content.heading[0].head_2":req.body.head_2,
      "content.heading[0].sub_head":req.body.sub_head,
    }})
    console.log(banner);
    if(banner){
      res.redirect('/admin/add-banner')
    }
  } catch (error) {
    console.log(error.message)
  }

}
const adminLoadCoupon = async(req,res)=>{
  try {
    const offerData = await Coupon.find({});
    res.render("admin-coupon", { coupon: offerData });
    
  } catch (error) {
    console.log(error.message);
    
  }

}

const adminStoreCoupon = async(req,res)=>{
  const coupon = Coupon({
    name: req.body.name,
    description:req.body.description,
    discount_type: req.body.discount_type,
    discount: req.body.discount,
    min_value:req.body.min_value,
    max_discount:req.body.max_discount
  });
  await coupon.save();
  res.status(201).redirect("/admin/admin-coupon");

}

const editCoupon = async(req,res)=>{
  try {
    let id = req.params.id;
    const coupon  = await Coupon.findById({_id:id})
    if(coupon){
      res.status(200).render('edit-coupon',{coupon:coupon})
    }
  } catch (error) {
    console.log(error.message);
    
  }
}

const updateCoupon = async(req,res)=>{
  try {
    const id = req.body.id;
console.log(id);
    const coupon = await Coupon.findByIdAndUpdate({_id:id},{$set:{
      name:req.body.name,
      description:req.body.description,
      discount_type:req.body.discount_type,
      discount:req.body.discount,
      min_value:req.body.min_value,
      max_discount:req.body.max_discount
    }});
    if(coupon){
      res.status(200).redirect('/admin/admin-coupon')
    }
  } catch (error) {
    console.log(error.message);
    
  }

}

const deleteCoupon = async(req,res)=>{
  try {
    let id = req.params.id;
    let couponData;
  const toggleActive = await Coupon.findById({_id:id});
  if(toggleActive.isAvailable == true){
    couponData = await Coupon.findByIdAndUpdate(
      { _id: id },
      { $set: { isAvailable: false } }
    );
  }
  else{
    couponData = await Coupon.findByIdAndUpdate(
      { _id: id },
      { $set: { isAvailable: true } }
    );
  }
    

    if (couponData) res.redirect("/admin/admin-coupon");
  } catch (error) {
    console.log(error.message);
  }

}

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
    let sizes = '';
    if(req.body.size){
      sizes = req.body.size.map((x) => x)
    }
    const filter_brand = new Filter({
    categoryId: req.body.categoryId,
         })
        
         filter_brand.filter.brand.push({
          name: req.body.brand_name,
          size: sizes,
          color: req.body.color.map((x) => x),
          material: req.body.material.map((x) => x),
          material_type: req.body.material_type.map((x) => x),
         })
         
        
         console.log(filter_brand);
         const Data = await filter_brand.save();
         if(Data)
    res.status(200).redirect('/admin/filter-category')
    
  } catch (error) {
    console.log(error.message);
    
  }

}
module.exports = {
  adminSetup,
  adminSetupSave,
  loadLogin,
  verifyLogin,
  dashboard,
  logout,
  showUsers,
  addItems,
  addItemSave,
  editItem,
  updateItem,
  deleteItemImage,
  deleteItem,
  showItem,
  addCategory,
  addCategorySave,
  editCategory,
  updateCategory,
  deleteCategory,
  editUser,
  updateUser,
  banUser,
  removeBanUser,
  searchUser,
  addBanner,
  addBannerSave,
  currentBanner,
  editBanner,
  updateBanner,
  adminLoadCoupon,
  adminStoreCoupon,
  editCoupon,
  updateCoupon,
  deleteCoupon,
  addFilter,
  addFilterSave,
  updateBrands,
  updateBrandsDetails
};
