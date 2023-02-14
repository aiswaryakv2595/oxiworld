const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    discount_type:{
        type:String,    
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    min_value:{
        type:Number,
        required:true
    },
    max_discount:{
        type:Number,
        required:true
    },
    isAvailable:{
        type:Number,
        default:1
    },
    usedBy:[{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }]
})

module.exports = mongoose.model('Coupon',couponSchema)