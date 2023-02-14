const mongoose = require('mongoose')
const Product = require('../models/itemModel')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    
    role:{
        type:String,
        required:true
    },
    is_active:{
        type:Number,
        default:1
    },
    token:{
        type:String,
        default:''
    },
    cart:{
        item:[
            {
                productId:{
                    type:mongoose.Types.ObjectId,
                    ref:'Item',
                    required:true
                },
                qty:{
                    type:Number,
                    required:true,                    
                },
                price:{
                    type:Number
                }
            }
        ],
        totalprice:{
            type:Number,
            default:0
        }
    },
    wishlist:{
        item:[
            {
                productId:{
                    type:mongoose.Types.ObjectId,
                    ref:'Item',
                    required:true
                },
                price:{
                    type:Number
                },
                size:{
                    type:Number
                }
            }
        ]
    }
   
    
},{
    timestamps:true
});
userSchema.methods.addToCart = function(product,quantity){
    const cart = this.cart
    
    console.log('quanty'+quantity);
    const isExisting = cart.item.findIndex((objInItems) =>{
        return  (
            new String(objInItems.productId).trim()== new String(product._id).trim()
        )
    })

    if(isExisting>=0){
        cart.item[isExisting].qty += 1
    }else{
        cart.item.push({productId:product._id, qty:quantity, price:product.price})
    }
    cart.totalprice += product.price
    console.log('user in schema:',this);
    return this.save();

 }


  userSchema.methods.removefromCart = async function(productId){
    const cart = this.cart
        const isExisting = cart.item.findIndex(
            (objInItems)=>
            new String(objInItems.productId).trim() ===new String(productId).trim())
            if(isExisting >=0){
                const prod = await Product.findById(productId)
                cart.totalprice -= prod.price* cart.item[isExisting].qty
                if(cart.totalprice<=0)
                cart.totalprice =0;
                cart.item.splice(isExisting, 1)
                console.log('user in schema:',this);
                return this.save();
            }   
  }


  userSchema.methods.addToWishlist = async function(product){
    const wishlist = this.wishlist
    const isExisting = wishlist.item.findIndex(objInItems =>{
    return new String(objInItems.productId).trim() == new String(product._id).trim()
  })
  if(isExisting >= 0){
  }else{
    wishlist.item.push({
        productId:product._id,
        price:product.price
    })
  }
  return this.save();
  }


  userSchema.methods.removefromWishlist = async function(productId){
    const wishlist = this.wishlist
    const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
    if(isExisting >= 0){
        await Product.findById(productId)
        wishlist.item.splice(isExisting,1)
        return this.save()
    }
  }
module.exports = mongoose.model('User',userSchema)