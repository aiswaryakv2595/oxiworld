const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
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
    size: {
      type: String,
      required: true
    },
    color: {
        type: String,
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
     brand: {
        type: String,
        required: true
     },
    images: {
      type: String,
      required:true
    }
    
    }, {
    timestamps: true
    })

module.exports = mongoose.model('Category',categorySchema)