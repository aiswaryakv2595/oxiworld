const mongoose = require('mongoose')

const filterSchema = new mongoose.Schema({
   
    categoryId:{
        type:mongoose.Types.ObjectId,
        ref:'Category',
        required:true
    },
   
    brand:{
        type:String,
        required:true,                    
    },
    size:{
        type:Array,
                         
    },
   
    color: {
        type: Array,
        required: true
     },
     material: {
        type: Array,
        required: true
     },
     material_type: {
        type: Array,
        required: true
     },
     is_available: {
        type: Boolean,
        default:true
     },
  
    }, {
    timestamps: true
    })

module.exports = mongoose.model('Filter',filterSchema)