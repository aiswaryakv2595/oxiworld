const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Item = require("../models/itemModel");
const Banner = require("../models/bannerModel");
const bcrypt = require("bcrypt");
const message = require("../config/sms");
const randomString = require("randomstring");
const nodemailer = require("nodemailer");
const Filter = require("../models/filterModel");
const Coupon = require("../models/couponModel");
const Address = require("../models/addressModel");
const Orders = require("../models/orderModel");
const RazorPay = require("razorpay");
const Review = require("../models/reviewModel");

const crypto = require("crypto");

const country = require("country-state-picker");
require("dotenv").config();

let userSession;

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

let newUser;

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email, is_active: 1 });

    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (passwordMatch) {
        req.session.user_id = userData._id;
        req.session.role = userData.role;

        if (userData) {
          res.redirect("/profile");
        }
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

const forgetLoad = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const phone = req.body.phone;
    console.log(phone);
    newOtp = message.sendMessage(phone, res);

    console.log(newOtp);
    res.render("forget-password", { phone, newOtp });
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const enteredOtp = req.body.otp;
    const newOtp = req.body.newOtp;
    if (enteredOtp == newOtp) {
      res.render("reset-password", { phoneNumber });
    } else {
      res.status(404).render("404");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const newPassword = req.body.password;

    const secure_password = await securePassword(newPassword);

    const updatedData = await User.updateOne(
      { phone: phoneNumber },
      { $set: { password: secure_password, token: "" } }
    );
    if (updatedData) res.status(200).redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

const profile = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const category = await Category.find({ is_available: true });
    const limit = 4;
    const item = await Item.find({ is_available: true })
      .populate("category_id")
      .limit(limit);

    const banner = await Banner.find({ is_active: 1 });
    const coupon = await Coupon.find({ isAvailable: 1 });

    res.status(200).render("profile", {
      user: userData,
      banners: banner,
      coupon: coupon,
      categories: category,
      items: item,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
        res.status(404).send("error");
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const register = async (req, res) => {
  try {
    const country_code = await country.getCountries();

    res.status(200).render("register", { country_code: country_code });
  } catch (error) {
    console.log(error.message);
  }
};

const saveUser = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const gender = req.body.gender;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (!gender) {
      res.render("register", { message: "Select one" });
    }
    const validate = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (validate) {
      res.render("register", { message: "user already exist" });
    } else if (req.body.password == confirmPassword) {
      newUser = {
        name: name,
        email: email,
        password: password,
        phone: phone,
        gender: gender,
        role: "user",
      };
      console.log(phone);
      if (newUser) next();
    } else {
      res.render("register", { message: "Password should match" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtp = async (req, res) => {
  const userData = newUser;
  const phone = userData.phone;

  newOtp = message.sendMessage(phone, res);
  console.log(newOtp);
  res.render("otp", { newOtp, userData });
};

const verifyOtp = async (req, res) => {
  try {
    const otp = req.body.newotp;
    console.log(req.body.otp);
    if (otp === req.body.otp) {
      const password = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        gender: req.body.gender,
        role: "user",
      });
      await user.save().then(() => console.log("register successfull"));
      if (user) {
        req.session.user_id = user._id;
        req.session.role = user.role;
        res.status(201).redirect("/profile");
      } else {
        res.status(404).render("otp", { message: "Invalid Otp" });
      }
    } else {
      console.log("otp not match");
    }
  } catch (error) {
    console.log(error.message);
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
const showCollections = async (req, res, next) => {
  try {
    const pageSize = 6; // Number of items per page
    const page = req.query.page ? parseInt(req.query.page, 10) : 1; // Current page number

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    // Create a new query object to include pagination parameters
    const queryPage = { ...req.query };
    delete queryPage.page;

    const categories = await Category.find({});
    const filters = await Filter.find({});
    const categoryId = req.query.categoryId;
    const brands = req.query.brands || [];

    // Add category filter to Item.find() query
    const query = categoryId ? { category_id: categoryId } : {};
    if (brands.length) {
      query.brand = { $in: brands };
    }
    const products = await Item.find(query)
      .populate("brand_id")
      .populate("category_id")
      .skip(startIndex)
      .limit(pageSize);
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
    const uniqueMaterialTypes = getUniqueValues(filters, "material_type");

    res.locals.categories = categories;
    res.locals.user = userData;
    res.locals.products = products;
    res.locals.uniqueBrands = uniqueBrands;
    res.locals.uniqueColors = uniqueColors;
    res.locals.uniqueMaterials = uniqueMaterials;
    res.locals.uniqueMaterialTypes = uniqueMaterialTypes;
    // res.locals.totalPages = totalPages;
    // res.locals.currentPage = page;
    // res.locals.next = next;
    // res.locals.prev = prev;

    res.status(200).render("collections", { pagination });
  } catch (err) {
    next(err);
  }
};

const showCart = async (req, res) => {
  try {
    let id = req.query.id;
    const quantity = parseInt(req.query.qty);
    const singleProduct = await Item.findById({ _id: id });
    const userData = await User.findById({ _id: req.session.user_id });

    userData.addToCart(singleProduct, quantity);
    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const loadCart = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    const completeUser = await userData.populate("cart.item.productId");
    // console.log(completeUser.cart);
    console.log(completeUser.cart.item);
    const totalprice = completeUser.cart.item.reduce(
      (acc, item) => acc + item.price,
      0
    );
    console.log('totoal price in cart', totalprice);
    
    completeUser.cart.totalprice = totalprice;

    const grandTotal = totalprice + 45;

    res.status(200).render("cart", {
      user: userData,
      cartProducts: completeUser.cart,
      totalprice: totalprice,
      grandTotal,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const editCart = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(req.query);

    userSession = req.session;
    const userdata = await User.findById({ _id: userSession.user_id });

    const foundproduct = userdata.cart.item.findIndex(
      (objInItems) => objInItems.productId == id
    );
    const qty = { a: parseInt(req.body.qty) };
    console.log(a);
    console.log(qty);
    console.log(foundproduct);
    userdata.cart.item[foundproduct].qty = qty.a;
    console.log(qty.a);
    userdata.cart.totalprice = 0;
    const price = userdata.cart.item[foundproduct].price;
    const totalprice = userdata.cart.item.reduce((acc, curr) => {
      return acc + curr.price * curr.qty;
    }, 0);
    userdata.cart.totalprice = totalprice;
    await userdata.save();
    res.json({ totalprice, price });
  } catch (error) {
    console.log(error.message);
  }
};

const removeItem = async (req, res) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await User.findById({ _id: userSession.user_id });
    const qty = userData.cart.qty;
    console.log(qty);
    userData.removefromCart(productId);
    res.status(200).redirect("/load-cart");
  } catch (error) {
    console.log(error.message);
  }
};
const loaduserwishlist = async (req, res) => {
  try {
    userSession = req.session;
    if (userSession.user_id) {
      const userdata = await User.findById({ _id: userSession.user_id });
      const completeuser = await userdata.populate("wishlist.item.productId");
      res.render("userwishlist.ejs", {
        id: userSession.user_id,
        user: userdata,
        wishlistproducts: completeuser.wishlist,
      });
    } else {
      res.status(200).render("userwishlist.ejs", { id: userSession.user_id });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addtowishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    userSession = req.session;
    const userdata = await User.findById({ _id: userSession.user_id });
    const productdata = await Item.findById({ _id: productId });
    userdata.addToWishlist(productdata);
    console.log(productdata);
    res.status(201).redirect("/productdetails/" + productId);
  } catch (error) {
    console.log(error.message);
  }
};

const addcartDeletewishlist = async (req, res) => {
  try {
    const userSession = req.session;
    const productId = req.query.id;
    const userdata = await User.findById(userSession.user_id);
    const productdata = await Item.findById(productId);
    if (!userdata || !productdata) {
      return res.status(404).send("User or product not found");
    }
    await userdata.addToCart(productdata, 1);
    await userdata.removefromWishlist(productId);
    res.redirect("/loaduserwishlist");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
};

const deletewishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userdata = await User.findById({ _id: userSession.user_id });
    userdata.removefromWishlist(productId);
    res.status(200).redirect("/loaduserwishlist");
  } catch (error) {
    console.log(error.message);
  }
};
const updateCartItem = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const userId = req.session.user_id;

    const user = await User.findById(userId).populate("cart.item.productId");

    const cartItem = user.cart.item.find(
      (item) => item.productId._id.toString() === productId.toString()
    );

    const productPrice = cartItem.productId.price;

    const qtyChange = qty - cartItem.qty;

    cartItem.qty = qty;
    cartItem.price = productPrice * qty;

    // recalculate the total price of the cart
    const totalprice = user.cart.item.reduce(
      (acc, item) => acc + item.price,
      0
    );
    user.cart.totalprice = totalprice;

    // mark the cart and totalprice fields as modified
    user.markModified("cart");
    user.markModified("cart.totalprice");

    // save the updated user document
    await user.save();

    // send the updated subtotal and grand total back to the client
    const subtotal = user.cart.item.reduce((acc, item) => acc + item.price, 0);
    const grandTotal = subtotal + 45;

    res.json({ subtotal, grandTotal, productPrice, qtyChange });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating cart item");
  }
};

const loadCheckout = async (req, res) => {
  const user_id = req.session.user_id;

  const address = await Address.find({ userId: user_id }).populate("userId");
  const user = await User.findById({ _id: user_id });
  const countries = country.getCountries();

  const completeUser = await user.populate("cart.item.productId");
  
  const totalprice = completeUser.cart.item.reduce(
    (acc, item) => acc + item.price,
    0
  );
  // console.log('completeUser.cart.totalprice',completeUser.cart.totalprice);
  completeUser.cart.totalprice = totalprice;
  const grandTotal = totalprice + 45;
  console.log('user in checkout',completeUser);
  res.render("checkout", {
    totalPrice: grandTotal,
    user: user,
    address: address,
    countries: countries,
  });
};
let order;
const placeOrder = async (req, res) => {
  userSession = req.session;
  const userId = userSession.user_id;
  const payment = req.body.payment;
  const address_id = req.body.address_id;
  let totalPrice;

  const userData = await User.findById({ _id: userId });
  const completeUser = await userData.populate("cart.item.productId");
  const couponData = await Coupon.find({ usedBy: userId });

  if (couponData) {
    delete userSession.offer;
    delete userSession.couponTotal;
  }

  const totalprice = completeUser.cart.item.reduce(
    (acc, item) => acc + item.price,
    0
  );
  completeUser.cart.totalprice = totalprice;

  totalPrice = userSession.couponTotal || completeUser.cart.totalprice;
  let updatedTotal = totalPrice + 45;

  userData.cart.totalprice = updatedTotal;
  const updatedUserData = await userData.save();
  console.log(completeUser.cart);

  const offerName = userSession.offer ? userSession.offer.name : "None";
  if (updatedTotal > 0) {
    order = await Orders({
      userId: userId,
      payment: payment,
      addressId: address_id,
      products: {
        item: completeUser.cart.item,
        totalPrice: updatedTotal,
      },
      offer: offerName,
    });

    let orderProductStatus = [];
    for (let key of order.products.item) {
      orderProductStatus.push(0);
    }

    order.productReturned = orderProductStatus;

    userSession.currentOrder = order._id;
    console.log("orderid--" + userSession.currentOrder);

    if (req.body.payment == "Cash-On-Delivery") {
      // If payment method is COD, set status to Placed and redirect to success page
      order.status = "Placed";
      await order.save();
      res.redirect("/success");
    } else if (req.body.payment == "RazorPay") {
      // If payment method is Razorpay, create a new order on Razorpay and redirect to the checkout page
      try {
        var instance = new RazorPay({
          key_id: process.env.key_id,
          key_secret: process.env.key_secret,
        });
        let razorpayOrder = await instance.orders.create({
          amount: updatedTotal * 100, // Amount in paise
          currency: "INR",
          receipt: order._id.toString(),
        });
        res.render("razorpay", {
          userId: userSession.user_id,
          total: updatedTotal,
          order_id: razorpayOrder.id,
          key_id: process.env.key_id,
          user: userData,
          order: order,
          orderId: order._id.toString(), // Pass the order ID to the checkout page
        });
      } catch (err) {
        order.status = "Payment failed";
        await order.save();
        res.redirect("/payment-failed");
      }
    } else {
      res.redirect("/collection");
    }
  } else {
    res.redirect("/checkout");
  }
};

const razorpayCheckout = async (req, res) => {
  try {
    const paymentId = req.body.payment_id;

    const userId = req.session.user_id;
    const order_id = req.body.order_id;

    var instance = new RazorPay({
      key_id: process.env.key_id,
      key_secret: process.env.key_secret,
    });

    console.log("Order: ", order);

    // Check if the order exists and belongs to the current user
    if (!order || order.userId.toString() !== userId) {
      return res.status(400).send("Invalid order");
    }

    // Check if the payment was successful
    const payment = await instance.payments.fetch(paymentId);
    console.log(payment);
    if (payment.status !== "captured") {
      order.status = "Payment failed";
      await order.save();
      return res.redirect("/checkout");
    }

    // Update the order status and save the order
    order.status = "Placed";

    await order.save();

    res.redirect("/success");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const returnproduct = async(req,res)=>{
  try {
      const userSession = req.session;
      console.log('session--->', userSession);
      const orderId = userSession.currentorder;
      const itemId = req.query.id;
      
      // Find the order and item
      const order = await Orders.findOne({_id: orderId, userId: userSession.user_id});
      const item = await Item.findById(itemId);

      if (!order || !item) {
        // Handle case where order or item cannot be found
        return res.status(404).send("Order or item not found");
      }

      // Find the item in the order
      const orderItem = order.products.item.find(item => item.productId.toString() === itemId);
      
      if (!orderItem) {
        // Handle case where item is not in the order
        return res.status(404).send("Item not found in order");
      }

      if (order.status !== 'Delivered' || orderItem.productReturned === 1) {
        // Handle case where order is not delivered or item is already returned
        return res.status(400).send("Cannot return item");
      }

      // Update the quantity of the item and set productReturned to 1
      item.quantity += orderItem.qty;
      orderItem.productReturned = 1;

      // Check if all items in the order have been returned
      const allItemsReturned = order.products.item.every(item => item.productReturned === 1);
      if (allItemsReturned) {
        order.status = 'Returned';
      }

      // Save changes to the order and item
      await Promise.all([order.save(), item.save()]);

      // Redirect the user to the profile page
      res.redirect('/profile');
      
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred");
  }
}


const saveAddress = async (req, res) => {
  const address = new Address({
    userId: req.session.user_id,
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    phone: req.body.phone,
    landmark: req.body.landmark,
  });
  const addressData = await address.save();
  if (addressData) {
    res.json({
      success: true,
      message: "Address updated successfully",
      address: addressData,
    });
  } else {
    res.status(500).redirect("/checkout");
  }
};

const editAddress = async (req, res) => {
  const addressId = req.body.address_id;
  const { name, address, city, state, zip, phone, landmark } = req.body;

  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        name,
        address,
        city,
        state,
        zip,
        phone,
        landmark,
      },
      { new: true }
    );
    if (updatedAddress) {
      res.json({
        success: true,
        message: "Address updated successfully",
        address: updatedAddress,
      });
    } else {
      res.status(404).json({ success: false, message: "Address not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const userProfile = async (req, res) => {
  const address = await Address.find({ userId: req.session.user_id }).populate(
    "userId"
  );
  const user = await User.findById({ _id: req.session.user_id });
  const countries = country.getCountries();
  const coupons = await Coupon.find({});

  res.render("user-profile", {
    user: user,
    address: address,
    countries: countries,
    coupons: coupons,
  });
};

const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body;
    const { user_id } = req.session;
    let message = "";

    if (!user_id) {
      throw new Error("User not logged in");
    }

    const user = await User.findById(user_id).populate("cart.item.productId");

    if (!user.cart || !user.cart.item || user.cart.item.length === 0) {
      throw new Error("Cart is empty");
    }

    const couponData = await Coupon.findOne({ name: coupon });

    if (!couponData) {
      throw new Error("Coupon not found");
    }

    req.session.offer = {
      name: couponData.name,
      type: couponData.discount_type,
      discount: couponData.discount,
    };

    let totalPrice = Number(user.cart.totalprice);
    console.log('total price in coupon', totalPrice);

    if (isNaN(totalPrice)) {
      throw new Error("Total price is NaN");
    }

    let updatedTotal;
    let discount_value;
    
    if (couponData.usedBy.includes(user_id)) {
      message = "Coupon Already used";
      delete req.session.offer;
      // throw new Error('Coupon has already been used');
    } else if (user.cart.totalprice > couponData.min_value) {
      console.log(user.cart.totalprice);
      
      if (couponData.discount_type === "AMOUNT") {
        discount_value = couponData.discount
        updatedTotal = totalPrice - discount_value + 45;
      } 
      else if (couponData.discount_type === "PERCENTAGE") {
        const max_discount = couponData.max_discount 
       
        discount_value = totalPrice * (couponData.discount / 100)
        if(discount_value>=max_discount)
        discount_value = max_discount;
        updatedTotal = totalPrice - discount_value +45
        // if(updatedTotal>max_discount)
        // updatedTotal = max_discount
      } else {
        throw new Error("Invalid discount type");
      }
    } else {
      message += "Minimum Order value is " + couponData.min_value;
      // throw new Error('Coupon has already been used');
    }
    console.log("updated total" + updatedTotal);
    req.session.couponTotal = updatedTotal;

    res.json({ updatedTotal, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const orderSuccess = async (req, res) => {
  try {
    userSession = req.session;
    const userdata = await User.findById({ _id: userSession.user_id });

    const productdata = await Item.find();
    for (const key of userdata.cart.item) {
      console.log(key.productId, " + ", key.qty);
      for (const prod of productdata) {
        if (new String(prod._id).trim() == new String(key.productId).trim()) {
          prod.stock = prod.stock - key.qty;
          await prod.save();
        }
      }
    }
    await Orders.find({
      userId: userSession.user_id,
    });
    await Orders.updateOne(
      { userId: userSession.user_id, _id: userSession.currentorder },
      { $set: { status: "Build" } }
    );
    await User.updateOne(
      { _id: userSession.user_id },
      {
        $set: {
          "cart.item": [],
          "cart.totalprice": "0",
        },
      },
      { multi: true }
    );
    console.log("order Built and cart is empty");

    userSession.coupontotal = 0;
    res.render("order-success", {
      orderId: userSession.currentorder,
      user: userdata,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadorderdetails = async (req, res) => {
  try {
    userSession = req.session;
    const userdata = await User.findById({ _id: userSession.user_id });
    const orderdata = await Orders.find({ userId: userSession.user_id }).sort({
      createdAt: -1,
    });
    res.render("order-details", {
      id: userSession.user_id,
      user: userdata,
      userorders: orderdata,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelorder = async (req, res) => {
  try {
    userSession = req.session;

    const id = req.query.id;
    await Orders.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status: "Canceled",
        },
      }
    );
    res.redirect("/loadorderdetails");
  } catch (error) {
    console.log(error.message);
  }
};

const vieworder = async (req, res) => {
  try {
    userSession = req.session;
    const userdata = await User.findById({ _id: userSession.user_id });
    const id = req.query.id;
    userSession.currentorder = id;
    const orderdata = await Orders.findById({
      _id: id,
      userId: userSession.user_id,
    }).populate("addressId");
    const itemTotal = orderdata.products.item.reduce(
      (accumulator, currentValue) =>
        accumulator + currentValue.price * currentValue.qty,
      0
    );
    console.log("order: " + orderdata.products);
    await orderdata.populate("products.item.productId");
    const productIds = orderdata.products.item.map((item) => item.productId);
    const review = await Review.find({
      userId: userSession.user_id,
      productId: { $in: productIds },
    });
    console.log("review: " + review);
    res.render("viewOrder", {
      order: orderdata,
      user: userdata,
      itemTotal,
      id: userSession.user_id,
      review: review,
    });
  } catch (error) {
    console.log(error.message);
  }
};
//updatr profile
const updateProfile = async (req, res) => {
  try {
    const { id, name, email, phone, gender, password } = req.body;
    const passwordHash = await securePassword(password);

    const userData = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: name,
          password: passwordHash,
          email: email,
          phone: phone,
          gender: gender,
        },
      }
    );
    if (userData) {
      res.status(200).redirect("/view-profile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//delete address
const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const addressData = await Address.findByIdAndDelete({ _id: id });
    if (addressData) res.status(200).redirect("/view-profile");
  } catch (error) {
    console.log(error.message);
  }
};
// change password

const changePassword = async (req, res) => {
  const password = req.body.password;
  const new_password = req.body.new_password;
  const confirm_password = req.body.confirm_password;
  const userData = await User.findById({ _id: req.session.user_id });
  const passwordMatch = await bcrypt.compare(password, userData.password);
  if (passwordMatch) {
    if (new_password == confirm_password) {
      const new_passwordHash = await securePassword(new_password);
      const changePassword = await User.findByIdAndUpdate(
        { _id: req.session.user_id },
        {
          $set: {
            password: new_passwordHash,
          },
        }
      );
      if (changePassword) delete req.session.user_id;
      res.status(201).redirect("/login");
    } else {
      res.status(500).redirect("/view-profile");
    }
  } else {
    res.status(500).redirect("/view-profile");
  }
};

const addReview = async (req, res) => {
  const { rate, description, productId, orderId } = req.body;
  const order = await Orders.find({ "products.item.productId": productId });
  if (order) {
    const review = new Review({
      userId: req.session.user_id,
      productId: productId,
      description: description,
      rating: rate,
    });
    const reviewData = await review.save();
    if (reviewData) {
      res.status(201).redirect("/loadOrderDetails");
    }
  }
};

const updateReview = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { rate, description, productId, reviewId } = req.body;

    const reviewData = await Review.findByIdAndUpdate(
      { _id: reviewId },
      {
        $set: {
          userId: userId,
          productId: productId,
          description: description,
          rating: rate,
        },
      }
    );

    if (reviewData) {
      res.status(200).json({ message: "review updated successfully" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadLogin,
  verifyLogin,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  profile,
  logout,
  register,
  saveUser,
  loadOtp,
  verifyOtp,
  showCollections,
  showCart,
  loadCart,
  editCart,
  removeItem,
  loaduserwishlist,
  addtowishlist,
  addcartDeletewishlist,
  deletewishlist,
  updateCartItem,
  loadCheckout,
  placeOrder,
  userProfile,
  saveAddress,
  editAddress,
  applyCoupon,
  orderSuccess,
  razorpayCheckout,
  loadorderdetails,
  cancelorder,
  vieworder,
  returnproduct,
  updateProfile,
  deleteAddress,
  changePassword,
  addReview,
  updateReview,
};
