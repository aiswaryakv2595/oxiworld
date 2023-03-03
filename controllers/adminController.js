const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Banner = require("../models/bannerModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const fs = require("fs");
const path = require("path");
const Item = require('../models/itemModel')


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
    const orderData = await Order.find({ status: "Delivered" });
    const count = await Order.count({ status: "Delivered" });

    console.log(count);
    res
      .status(200)
      .render("dashboard", { user: userData, orders: orderData, count: count });
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

//
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

const addBanner = async (req, res) => {
  try {
    const banner = await Banner.find({});
    console.log(banner);
    res.render("add-banner", { banner: banner });
  } catch (error) {
    console.log(error.message);
  }
};

const addBannerSave = async (req, res) => {
  try {
    const newBanner = req.body.banner;

    const a = req.files;
    // console.log(req.files);
    const banner = new Banner({
      banner: newBanner,
      bannerImage: a.map((x) => x.filename),
    });
    banner.content.heading.push({
      head_1: req.body.head_1,
      head_2: req.body.head_2,
      sub_head: req.body.sub_head,
    });
    const bannerData = await banner.save();

    if (bannerData) {
      res.redirect("/admin/add-banner");
    }
  } catch (error) {}
};

const currentBanner = async (req, res) => {
  try {
    const id = req.query.id;

    await Banner.findOneAndUpdate({ is_active: 1 }, { $set: { is_active: 0 } });
    await Banner.findByIdAndUpdate({ _id: id }, { $set: { is_active: 1 } });
    res.redirect("/admin/add-banner");
  } catch (error) {
    console.log(error.message);
  }
};

const editBanner = async (req, res) => {
  try {
    const id = req.query.id;
    const banner = await Banner.findById({ _id: id });
    const bannerImage = banner.bannerImage.map((x) => x);
    let content = banner.content.heading.map((x) => x).flat();
    console.log(content);

    if (banner) {
      res.status(200).render("edit-banner", {
        banner: banner,
        bannerImage: bannerImage,
        content: content,
      });
    } else {
      res
        .status(404)
        .render("edit-banner", { message: "Something went wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateBanner = async (req, res) => {
  try {
    const id = req.body.id;
    const oldImages = req.body.old_images.split(",");
    const newImages = req.files ? req.files.map((file) => file.filename) : [];
    const images = [...oldImages, ...newImages];

    const content = req.body.content
      ? req.body.content.map((row) => ({
          head_1: row.head_1,
          head_2: row.head_2,
          sub_head: row.sub_head,
        }))
      : [];

    const updateFields = {
      banner: req.body.banner,
      bannerImage: images,
      content: { heading: content },
    };

    const banner = await Banner.findByIdAndUpdate(id, { $set: updateFields });
    console.log(banner);
    if (banner) {
      res.redirect("/admin/add-banner");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const adminLoadCoupon = async (req, res) => {
  try {
    const offerData = await Coupon.find({});
    res.render("admin-coupon", { coupon: offerData });
  } catch (error) {
    console.log(error.message);
  }
};

const adminStoreCoupon = async (req, res) => {
  const coupon = Coupon({
    name: req.body.name,
    description: req.body.description,
    discount_type: req.body.discount_type,
    discount: req.body.discount,
    min_value: req.body.min_value,
    max_discount: req.body.max_discount,
  });
  await coupon.save();
  res.status(201).redirect("/admin/admin-coupon");
};

const editCoupon = async (req, res) => {
  try {
    let id = req.params.id;
    const coupon = await Coupon.findById({ _id: id });
    if (coupon) {
      res.status(200).render("edit-coupon", { coupon: coupon });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateCoupon = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    const coupon = await Coupon.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          discount_type: req.body.discount_type,
          discount: req.body.discount,
          min_value: req.body.min_value,
          max_discount: req.body.max_discount,
        },
      }
    );
    if (coupon) {
      res.status(200).redirect("/admin/admin-coupon");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    let id = req.params.id;
    let couponData;
    const toggleActive = await Coupon.findById({ _id: id });
    if (toggleActive.isAvailable == true) {
      couponData = await Coupon.findByIdAndUpdate(
        { _id: id },
        { $set: { isAvailable: false } }
      );
    } else {
      couponData = await Coupon.findByIdAndUpdate(
        { _id: id },
        { $set: { isAvailable: true } }
      );
    }

    if (couponData) res.redirect("/admin/admin-coupon");
  } catch (error) {
    console.log(error.message);
  }
};

const orders = async (req, res) => {
  const orders = await Order.find({ status: { $ne: "Attempted" } }).populate(
    "userId"
  );
  res.status(200).render("orders", { orders: orders });
};

const viewOrders = async (req, res) => {
  const orderId = req.params.id;
  const orders = await Order.findById({
    _id: orderId,
    status: { $ne: "Attempted" },
  })
    .populate("userId")
    .populate("addressId")
    .populate("products.item.productId");

  if (orders) {
    res.status(200).render("view-order", {
      orders: orders,
    });
  }
};
const cancelOrder = async (req, res) => {
  const orderId = req.body.orderId;
  const orders = await Order.findByIdAndUpdate(
    { _id: orderId },
    {
      $set: {
        status: "Canceled",
      },
    }
  );
  if (orders) {
    res.json({
      success: true,
      message: "Order Canceled successfully",
      orders: orders,
    });
  }
};
const changeStatus = async (req, res) => {
  const orderId = req.body.id;
  const status = req.body.status;
  const orders = await Order.findByIdAndUpdate(
    { _id: orderId },
    {
      $set: {
        status: status,
      },
    }
  );
  console.log(orders);
  if (orders) {
    res.json({
      success: true,
      message: "Status changed successfully",
      orders: orders,
    });
  }
};

const viewSales = async (req, res) => {
  const products = await Item.find({}).populate('category_id');
 
 let counts
  const qty =await  Order.aggregate([
    {$unwind:'$products.item'},
    {$group:{_id:"$products.item.productId",count:{$sum:1}}}
  ]).then((result)=>{
     counts = result.map(({_id,count})=>({productId:_id,count}))
    console.log('Counts',counts);
  })


console.log('counts details',counts);

  
  res.status(200).render("sales", { products: products });
};

const getSales = async (req, res) => {
  try {

    const startdate = new Date(req.body.from)
    const enddate = new Date(req.body.to)

    console.log(startdate);
    console.log(enddate);

    const orders = await Order.aggregate([
      {
          $match:{
              createdAt:{
                  $gte: startdate,
                  $lt: enddate
              },
              status:'Delivered',
          },
      },
      
  ])
    
    console.log(orders);

    res.json(orders); // include the orders array in the response data
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
  orders,
  viewOrders,
  cancelOrder,
  changeStatus,
  viewSales,
  getSales
};
