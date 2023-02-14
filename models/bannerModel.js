const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    banner:{
        type:String,
        required:true
    },
    bannerImage:{
        type:Array,
        required:true
    },
    content:{
        heading:[
            {
                head_1:{
                    type: String,
                    required:true
                },
                head_2:{
                    type: String,                  
                },
                sub_head:{
                    type: String, 
                    required:true                 
                }
            }
        ]
    },
    is_active:{
        type:Number,
        default:0
    }
}, {
    timestamps: true
  
})

module.exports = mongoose.model('Banner',bannerSchema)