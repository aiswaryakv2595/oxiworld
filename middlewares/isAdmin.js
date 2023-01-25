const Admin = require('../models/adminModel')

const isAdmin = async(req,res,next)=>{
    try {
        
        const userData = await Admin.find({})
        if(userData.length == 0 && req.originalUrl!='/admin/admin-setup'){
            res.redirect('/admin/admin-setup')
        }
        else{
            next();
        }


    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    isAdmin
}