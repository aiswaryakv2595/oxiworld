const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Item = require('../models/itemModel')
const Banner = require('../models/bannerModel')
const bcrypt = require('bcrypt')
const message = require('../config/sms')
const randomString = require('randomstring')
const nodemailer = require('nodemailer')
const Filter = require('../models/filterModel')
const Coupon = require('../models/couponModel')

const country = require('country-state-picker')
require("dotenv").config();

let userSession;


const securePassword = async(password)=>{
    try {
       const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}


let newUser;

const loadLogin = async(req,res)=>{
    try {
        res.render('login')
        
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
       
      const userData = await User.findOne({email:email,is_active:1});
    
       
       
      if (userData) {

      const passwordMatch = await bcrypt.compare(req.body.password,userData.password)
      
      if (passwordMatch) {
        req.session.user_id = userData._id;
        req.session.role = userData.role
       
        if (userData) {
                      
            res.redirect('/profile')
        }
        
      } else {
        res.render('login',{message:'Email or Pasword is incorrect'})
        
      }
        
      } else {
        res.render('login',{message:"Login Failed"})
        
      }
        
    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad = async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message)
    }
}

const forgetVerify = async(req,res)=>{
    try {
        const phone = req.body.phone;
        console.log(phone);
        newOtp = message.sendMessage(phone,res);
        console.log(newOtp);
        res.render('forget-password', { phone,newOtp });
        
    } catch (error) {
        console.log(error.message)
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try {
        const phoneNumber = req.body.phoneNumber;
        const enteredOtp = req.body.otp;
        const newOtp = req.body.newOtp;
        if (enteredOtp==newOtp) {
            res.render('reset-password',{ phoneNumber })
            
        } else {
            res.status(404).render('404');
        }
        
    } catch (error) {
        console.log(error.message);
    }

}

const resetPassword = async(req,res)=>{
    try {
        const phoneNumber = req.body.phoneNumber;
        const newPassword = req.body.password;

        const secure_password = await securePassword(newPassword)

        const updatedData = await User.updateOne({phone:phoneNumber},{$set:{password:secure_password,token:''}})
        if(updatedData)
        res.status(200).redirect('/login')
        
    } catch (error) {
        console.log(error.message);
    }

}

const profile = async(req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id})
        const category = await Category.find({is_available:true})
        const item = await Item.find({is_available:true}).populate('category_id');

        const banner = await Banner.find({is_active:1})
        const coupon = await Coupon.find({isAvailable:1})
        console.log(coupon);
       
        res.status(200).render('profile',{
            user:userData,
            banners: banner,
            coupon:coupon,
            categories:category,
            items:item
        })
        
    } catch (error) {
       console.log(error.message); 
    }
}

const logout = async(req,res)=>{
    try {

        req.session.destroy(function(err){
            if(err){
                console.log(err);
                res.status(404).send("error")
            }
            else{
               
               res.redirect('/login');
            }
         })
      
        
    } catch (error) {
        console.log(error.message);
    }

}

const register = async(req,res)=>{
    try {
        const country_code = await country.getCountries();
        res.status(200).render('register',{country_code:country_code})
        
    } catch (error) {
        console.log(error.message);
    }

}

const saveUser = async(req,res,next)=>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const gender = req.body.gender;
        const password = req.body.password;
        const confirmPassword =req.body.confirmPassword
        if(!gender){
            res.render('register',{message:'Select one'})
           
        }
        const validate = await User.findOne({$or:[{email:email},{phone:phone}]})
        if(validate){
            res.render('register',{message:'user already exist'})
        }
       else if (req.body.password == confirmPassword) {
            newUser = {
                name:name,
                email:email,
                password:password,
                phone:phone,
                gender:gender,                   
                role:"user",
                        
            };
            console.log(phone);
            if(newUser)
            next();
    
       
        
            
        }
        else{
            res.render('register',{message:'Password should match'})
        }
    } catch (error) {
        console.log(error.message);
    }

}

const loadOtp = async(req,res)=>{
    const userData = newUser;
    const phone = userData.phone;
    newOtp = message.sendMessage(phone,res);
    console.log(newOtp);
    res.render('otp',{newOtp,userData})

}

const verifyOtp = async(req,res)=>{
    try {
        const otp = req.body.newotp;
        console.log(req.body.otp);
        if(otp===req.body.otp){
            const password = await bcrypt.hash(req.body.password,10)
            const user = new User({
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
                password:password,
                gender:req.body.gender,
                role:"user"

            })
            await user.save().then(()=>console.log('register successfull'));
            if(user){
                req.session.user_id = user._id;
                req.session.role = user.role
                res.status(201).redirect('/profile')
            }
            else{
                res.status(404).render('otp',{message:'Invalid Otp'})
            }
        }
        else{
            console.log('otp not match');
        }
        
    } catch (error) {
        console.log(error.message);
    }

}

const productDetails = async(req,res)=>{
    try {
        const id = req.params.id;
        const userData = await User.findOne({_id:req.session.user_id})
        const allCategories = await Category.find({});
        const allProducts = await Item.find({}).populate('category_id','brand_id');

        const productDetail = await Item.findById({_id: id}).populate('category_id','brand_id');
        
        const filters = await Filter.find({"filter._id":productDetail.brand_id})
        let brands = [];
        filters.forEach(filter => {
          brands = brands.concat(filter.filter.brand);
        });
        console.log(brands);
      
        res.status(200).render('productdetails',{
            product:productDetail,
            user:userData,
            allitems:allProducts,
            allcate:allCategories,
            filter:brands
        })

        
    } catch (error) {
        console.log(error.message);
        
    }

}

const showCollections = async(req,res)=>{
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
      
   
const products = await Item.find({brand_id: {$in: brands.map(brand => brand._id)}})
   
    const allProducts = products
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
}



const showCart = async(req,res)=>{
try {
    let id = req.query.id;
    const quantity = req.query.qty
    const singleProduct = await Item.findById({_id:id})
    const userData = await User.findById({_id:req.session.user_id})
    
    userData.addToCart(singleProduct,quantity)
    res.status(200).redirect('/productdetails/'+id)
    
} catch (error) {
    console.log(error.message);
}
}

const loadCart = async(req,res)=>{

    try {
        const userData = await User.findById({_id:req.session.user_id})
        const completeUser = await userData.populate('cart.item.productId')
        res.status(200).render('cart',{
            user:userData,
            cartProducts:completeUser.cart
        })
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const editCart = async(req,res ) =>{
    try{
        const id = req.query.id
        console.log(req.query)
    
        userSession = req.session
        const userdata = await User.findById({_id:userSession.user_id})
        
        const foundproduct = userdata.cart.item.findIndex((objInItems)=> objInItems.productId == id);
        const qty = {a:parseInt(req.body.qty)};
        console.log(a);
        console.log(qty);
        console.log(foundproduct);
        userdata.cart.item[foundproduct].qty = qty.a 
        console.log( qty.a )
        userdata.cart.totalprice = 0
        const price = userdata.cart.item[foundproduct].price    
        const totalprice = userdata.cart.item.reduce((acc,curr)=>{
            return acc + curr.price* curr.qty   
        },0)
        userdata.cart.totalprice = totalprice
        await userdata.save()
        res.json({totalprice,price})
        
    }catch(error){
        console.log(error.message);
    }
}

const removeItem = async (req, res) => {

    try {
        const productId = req.query.id
        userSession = req.session
        const userData = await User.findById({ _id: userSession.user_id })
        userData.removefromCart(productId)
        res.status(200).redirect('/load-cart')
    }
    catch (error) {
        console.log(error.message)
    }

}
const loaduserwishlist = async(req,res)=>{
    try {
        userSession = req.session;
        if(userSession.user_id){
        const userdata = await User.findById({_id:userSession.user_id})
        const completeuser = await userdata.populate('wishlist.item.productId')
            res.render('userwishlist.ejs',{
                id:userSession.user_id,
                user:userdata,
                wishlistproducts:completeuser.wishlist
            })
        }else{
            res.status(200).render('userwishlist.ejs',{id:userSession.user_id})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addtowishlist = async(req,res)=>{
    try {
        const productId =req.params.id
        userSession = req.session
        const userdata = await User.findById({_id:userSession.user_id})
        const productdata = await Item.findById({_id:productId})
        userdata.addToWishlist(productdata)
        console.log(productdata)
        res.status(201).redirect('/productdetails/'+productId)
    } catch (error) {
        console.log(error.message);
    }

}

const addcartDeletewishlist = async(req,res)=>{
    try {
        userSession = req.session
        const productId = req.query.id
        const userdata = await User.findById({_id:userSession.user_id})
        const productdata = await Item.findById({_id:productId})
        const add = await userdata.addToCart(productdata)
        if(add){
        userdata.removefromWishlist(productId)
        }
        res.status(200).redirect('/loaduserwishlist')
    } catch (error) {
        console.log(error.message);
    }
}

const deletewishlist = async(req,res)=>{
    try {
        const productId = req.query.id
        userSession = req.session
        const userdata = await User.findById({_id:userSession.user_id})
        userdata.removefromWishlist(productId)
        res.status(200).redirect('/loaduserwishlist')
    } catch (error) {
        console.log(error.message);
    }
}
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
    productDetails,
    showCollections,
    showCart,
    loadCart,
    editCart,
    removeItem,
    loaduserwishlist,
    addtowishlist,
    addcartDeletewishlist,
    deletewishlist
}