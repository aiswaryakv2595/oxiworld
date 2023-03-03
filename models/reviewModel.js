const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    productId:{
        type:mongoose.Types.ObjectId,
        ref:'Item'
    },
    description:{
        type:String,
        required:true
    },
   
    rating:{
        type:Number,
        required:true
    },
   
   
})

module.exports = mongoose.model('Review',reviewSchema)