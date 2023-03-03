const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
   
    name: {
       type: String,
       required: true,
       trim: true
    },
   
     is_available: {
      type: Boolean,
      default:true
   },
   
    images:
      {
      type: String,
      required:true
    },
   
    }, {
    timestamps: true
    })

module.exports = mongoose.model('Category',categorySchema)