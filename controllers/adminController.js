const User = require('../models/userModel')
const Admin = require('../models/adminModel')
const Item = require('../models/itemModel')
const Category = require('../models/categoryModel')
const fs = require('fs')

const securePassword = async(password)=>{
    try {
       const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}

const adminSetup = async(req,res)=>{
    try {
        
        var user= await Admin.find({});
        if (user.length > 0) {
          
            res.redirect('/admin/login')
            
        } else {
            res.render('adminSetup')
        }

    } catch (error) {
        console.log(error.message);
        
    }
}

const adminSetupSave = async(req,res)=>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const user = new Admin({
            name:name,
            email:email,
            password:password,
            role:"admin",
        });

      const userData = await user.save();
      if (userData) {
        res.redirect('/admin/login')
        
      } else {
        res.render('adminSetup',{message:'Admin Setup failed'})
      }
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const loadLogin = async(req,res)=>{
    try {
        res.render('login')
        
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
      const userData = await Admin.findOne({email:email});
    
    //   console.log(userData);
       
      if (userData) {
      if (userData.password == password) {
        req.session.user_id = userData._id;
        req.session.role = userData.role
         res.redirect('/admin/dashboard')
         
      } else {
        res.render('login',{message:'Email or Pasword is incorrect'})
        
      }
        
      } else {
        res.render('login',{message:"Login Failed"})
        
      }
        
    } catch (error) {
        console.log(error.message);
    }
}


const dashboard = async(req,res)=>{
    try {
        const userData = await Admin.findOne({_id:req.session.user_id})
        res.render('dashboard',{user:userData})
    } catch (error) {
        console.log(error.message);
        
    }
}

const logout = async(req,res)=>{
    try {

        req.session.destroy(function(err){
            if(err){
                console.log(err);
                res.send("error")
            }
            else{
               
               res.redirect('/admin/login');
            }
         })
      
        
    } catch (error) {
        console.log(error.message);
    }

}

const showUsers = async(req,res)=>{
    try {
        const userData = await User.find({});
        res.render('show-users',{user:userData})
    } catch (error) {
        console.log(error.message);
        
    }

}

const addItems = async(req,res)=>{
    try {
        
        const category = await Category.find({}) 
        const itemData = await Item.find({}).populate('category_id');
       
        res.render('addItems',{item:itemData,category:category})
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const addItemSave = async(req,res,next)=>{

    try {
        const name = req.body.name;
        const category_id = req.body.category;
        const price = req.body.price;
        const description = req.body.description;
        const images =req.file.filename;
        console.log(req.category_id);
        
            const item = new Item({
                owner:req.session.user_id,
                name:name,
                description:description,
                category_id:category_id,
                price:price,
                images:images,
                      
            });
        
          const userData = await item.save();
          if (userData) {
           res.redirect('/admin/additems')
          } else {
            res.send('error')
          }
            
        
      
    } catch (error) {
        console.log(error.message);
        
    }
}

const editItem = async(req,res)=>{
    try {
        const id = req.params.id;
        const category = await Category.find({});
        const itemData = await Item.findById({_id:id});
       
        if(itemData){
            res.render('editItem',{item:itemData,category:category})
        }
        else{
            res.redirect('admin/additems')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const updateItem = async(req,res)=>{
    try {
        const catid = req.body.id;
        let new_image ="";

        const name = req.body.name;
        const category = req.body.category;
        const price = req.body.price;
        const description = req.body.description;
        

        if(req.file){
            new_image = req.file.filename;
          fs.unlinkSync('./uploads/'+ req.body.old_image)
  
        }
        else{
            new_image = req.body.old_image
        }

        const categoryData =await Item.findByIdAndUpdate({_id:catid},{$set:{name:name,description:description,category_id:category,price:price,images:new_image}})
       
       if (categoryData) {
 
        res.redirect('/admin/additems');
       }
       else{
        res.render('editItem',{message:'something went wrong!!!'})
       }
        
    } catch (error) {
        console.log(error.message);
    }
}

const deleteItem = async(req,res)=>{
    try {
        let id = req.params.id;
        const userData = await Item.findById({_id:id});
        if(userData.images != ''){
            console.log('success');
            try {
                const itemDelete = await Item.findByIdAndDelete({_id:id});
                fs.unlinkSync('./uploads/'+userData.images)
                if(itemDelete)
                res.redirect('/admin/additems');
                
            } catch (error) {
                console.log(error.message);
            }
        }
        
        else
        console.log('failed');
       
        res.redirect('/admin/addcategory')
        
        
     } catch (error) {
        
     }

}
// add category
const addCategory = async(req,res)=>{
    try {
        const categoryData = await Category.find({});
        res.render('addCategory',{category:categoryData})
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const addCategorySave = async(req,res,next)=>{

    try {
        const name = req.body.name;
        const size = req.body.size;
        const color = req.body.color;
        const material = req.body.material;
        const material_type = req.body.material_type;
        const brand = req.body.brand
        const images =req.file.filename;
        console.log(req.file);
        
            const category = new Category({
                owner:req.session.user_id,
                name:name,
                size:size,
                color:color,
                material:material,
                material_type:material_type,
                brand:brand,
                images:images,
                      
            });
    
          const categoryData = await category.save();
          if (categoryData) {
           res.redirect('/admin/addcategory')
          } else {
            res.redirect('/admin/addcategory')
          }
            
        
      
    } catch (error) {
        console.log(error.message);
        
    }
}

const editCategory = async(req,res)=>{
    try {
        const catId = req.params.categoryid;
      
        const catData = await Category.findById({_id:catId})
       
       
        if (catData) {
            
            res.render('editCategory',{category:catData})

        } else {
            res.redirect('/admin/addcategory')
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}
const updateCategory = async(req,res)=>{
    try {
        const catid = req.params.categoryid;
        let new_image ="";

        const name = req.body.name;
        const size = req.body.size;
        const color = req.body.color;
        const material = req.body.material;
        const material_type = req.body.material_type;
        const brand = req.body.brand;

        if(req.file){
            new_image = req.file.filename;
          fs.unlinkSync('./uploads/'+ req.body.old_image)
  
        }
        else{
            new_image = req.body.old_image
        }

        const categoryData =await Category.findByIdAndUpdate({_id:catid},{$set:{name:name,size:size,color:color,material:material,material_type:material_type,brand:brand,images:new_image}})
       console.log(categoryData);
       if (categoryData) {
 
        res.redirect('/admin/add')
       }
       else{
        res.render('editCategory',{message:'something went wrong!!!'})
       }
        
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategory = async(req,res)=>{
   
    
     try {
        let id = req.params.id;
        const userData = await Category.findById({_id:id});
        if(userData.images != ''){
            console.log('success');
            try {
                const catDelete = await Category.findByIdAndDelete({_id:id});
                fs.unlinkSync('./uploads/'+userData.images)
                if(catDelete)
                res.redirect('/admin/addcategory');
                
            } catch (error) {
                console.log(error.message);
            }
        }
        
        else
        console.log('failed');
       
        res.redirect('/admin/addcategory')
        
        
     } catch (error) {
        
     }
    
  
}
//end
const editUser = async(req,res)=>{

    try {
        const userId = req.body.userid;
        const userData = await User.findOne({_id:userId})
        
       
        if (userData) {
            
            res.render('edituserView.ejs',{user:userData})

        } else {
            res.redirect('/admin/showuser')
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
    
}

const updateUser = async(req,res)=>{
    try {
        const userId = req.body.id;
        const name = req.body.name;
        const email = req.body.email;
        console.log(req.body.password);
        const password = await securePassword(req.body.password);
        console.log(password);
        const phone = req.body.phone;
        const gender = req.body.gender;
        
       const userData =await User.findByIdAndUpdate({_id:userId},{$set:{name:name,email:email,password:password,phone:phone,gender:gender}})
    //    console.log(userData);
       if(userData){
        res.redirect('/admin/showusers')
       }
       else{
        res.render('editUserView',{message:'something went wrong!!!'})
       }
    } catch (error) {
        console.log(error.message);
    }
}

const deleteUser = async(req,res)=>{
    try {
        const userId = req.params.userid;
        const userData = await User.deleteOne({_id:userId})
        if (userData) {
            console.log('success');
            
        } else {
            console.log('failed');
            
        }
        res.redirect('/admin/showusers')
        
    } catch (error) {
        console.log(error.message);
        
    }

}

const searchUser = async(req,res) =>{
    const search = req.body.search;
    console.log(search);

    const userData = await User.find({name:{$regex:".*"+search+".*"}})
    console.log(userData);
    if(userData.length >0){
        res.render('show-users',{user:userData})
    }
    else{
        res.status(200).send('product not found')
    }
}
module.exports ={
    adminSetup,
    adminSetupSave,
    loadLogin,
    verifyLogin,
    dashboard,
    logout,
    showUsers,
    addItems,  
    addItemSave,
    editItem,
    updateItem,
    deleteItem,
    addCategory,
    addCategorySave,
    editCategory,
    updateCategory,
    deleteCategory,
    editUser,
    updateUser,
    deleteUser,
    searchUser
}