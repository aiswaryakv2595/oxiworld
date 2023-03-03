const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    name:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zip:{
        type:Number,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    landmark:{
        type:String,
    }
   
    
});

module.exports = mongoose.model('Address',addressSchema)