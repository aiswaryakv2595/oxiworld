const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    owner : {
       type: Object,
       required: true,
       ref: 'User'
    },
    name: {
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

    price: {
       type: Number,
       required: true
    },
    images: {
      type: String,
      required:true
    }
    
    }, {
    timestamps: true
    })

module.exports = mongoose.model('Item',itemSchema)