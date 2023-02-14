const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
   
    name: {
       type: String,
       required: true,
       trim: true
    },
    model_number: {
      type: String,
      required: true,
      trim: true
   },
    description: {
      type: String,
      required: true
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category'
     },
    
     brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Filter'
     },

    price: {
       type: Number,
       required: true
    },
    material: {
      type: String,
      required: true
   },
   material_type: {
      type: String,
      required: true
   },
    is_available: {
      type: Boolean,
      default:true
   },
   images: {
      type:Array,
      required: true
    },
    
    },
    
    {
    timestamps: true
    })

module.exports = mongoose.model('Item',itemSchema)