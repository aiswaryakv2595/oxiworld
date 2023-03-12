const express = require("express");
const user_route = express();

const path = require("path");

user_route.set("views", "./views/users");
user_route.use(express.static(path.join(__dirname, "public")));

const userController = require("../controllers/userController");

const userAuth = require("../middlewares/userAuth");
const { db } = require("../models/userModel");

user_route.get("/register", userAuth.isLogout, userController.register);
user_route.post("/register", userController.saveUser, userController.loadOtp);
user_route.get("/otp", userAuth.isLogout, userController.loadOtp);
user_route.post("/otp", userAuth.isLogout, userController.verifyOtp);

user_route.get("/login", userAuth.isLogout, userController.loadLogin);
user_route.post("/login", userController.verifyLogin);

user_route.get("/forget", userAuth.isLogout, userController.forgetLoad);
user_route.post("/forget", userController.forgetVerify);
user_route.get(
  "/verify-otp",
  userAuth.isLogout,
  userController.forgetPasswordLoad
);
user_route.post("/verify-otp", userController.forgetPasswordLoad);
user_route.post("/reset-password", userController.resetPassword);

user_route.get("/logout", userAuth.isLogin, userController.logout);

user_route.get("/", userController.profile);
user_route.get("/profile", userAuth.isLogin, userController.profile);



user_route.get("/add-to-cart", userAuth.isLogin, userController.showCart);
user_route.get("/load-cart", userAuth.isLogin, userController.loadCart);
user_route.get("/removeItem", userAuth.isLogin, userController.removeItem);
user_route.post("/editcart", userAuth.isLogin, userController.editCart);

user_route.get("/addtowishlist/:id",userAuth.isLogin,userController.addtowishlist);
user_route.get("/loaduserwishlist",userAuth.isLogin,userController.loaduserwishlist);
user_route.get("/addcartdeletewishlist",userAuth.isLogin,userController.addcartDeletewishlist);
user_route.get("/deletewishlist",userAuth.isLogin, userController.deletewishlist);
user_route.post("/updateCartItem", userController.updateCartItem);

user_route.get("/checkout", userAuth.isLogin, userController.loadCheckout);
user_route.post("/checkout", userController.placeOrder);

user_route.post("/saveaddress", userController.saveAddress);
user_route.post("/editaddress", userController.editAddress);

user_route.get("/view-profile", userController.userProfile);

user_route.post("/add-coupon", userController.applyCoupon);
user_route.get("/success", userController.orderSuccess);


user_route.post("/checkout/razorpay", userController.razorpayCheckout);

user_route.get(
  "/loadOrderDetails",
  userAuth.isLogin,
  userController.loadorderdetails
);
user_route.get("/cancelOrder", userAuth.isLogin, userController.cancelorder);


user_route.get("/viewOrder", userAuth.isLogin, userController.vieworder);

user_route.get('/returnProduct',userAuth.isLogin,userController.returnproduct)

//update - profile
user_route.post("/update-profile", userController.updateProfile);
//delete address
user_route.post("/delete-address", userController.deleteAddress);
//reset password
user_route.post("/change-password", userController.changePassword);

//user review
user_route.post("/add-review", userController.addReview);
user_route.post("/update-review", userController.updateReview);
module.exports = user_route;
