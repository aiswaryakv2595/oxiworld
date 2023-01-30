const User = require('../models/userModel')
const Admin = require('../models/adminModel')
const Item = require('../models/itemModel')
const Category = require('../models/categoryModel')
const fs = require('fs')
const sharp = require('sharp')

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
        
        const category = await Category.find({});
        const itemData = await Item.find({}).populate('category_id');
      
       
        res.render('addItems',{item:itemData,category:category})
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const addItemSave = async(req,res,next)=>{

    try {
        const name = req.body.name;
        const model_number = req.body.model_number;
        const category_id = req.body.category;
        const price = req.body.price;
        const description = req.body.description;
        const size = req.body.size;
        const color = req.body.color;
        const material = req.body.material;
        const material_type = req.body.material_type;
        const brand = req.body.brand;
        
        console.log(req.category_id);
        
            const item = new Item({
                name:name,
                model_number:model_number,
                description:description,
                category_id:category_id,
                price:price,
                size:size,
                color:color,
                material:material,
                material_type:material_type,
                brand:brand
               
                  
            });
            const uploadDir = "public/products";

            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
          
            const images = [];
          
            req.files.images = !req.files.images.length
              ? [req.files.images]
              : req.files.images;
            for (let i = 0; i < req.files.images.length; i++) {
              const image = req.files.images[i];
              let uploadPath = __dirname + "/../public/products/" + image.name;
          
              await new Promise((resolve) => {
                image.mv(uploadPath, (err) => {
                  if (err) throw err;
                  console.log(image);
                  if (!err) images.push(`products/${image.name}`);
                  resolve(true);
                });
              });
            }
            item.images = images;
            
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
        const itemData = await Item.findById({_id:id}).populate('category_id');
       
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
        const catid = req.params.id;
        const product = await Item.findOne({ _id: catid });
        console.log(req.body);
        let editedImages = JSON.stringify(req.body.old_image) || [];
       

  if (editedImages.length) editedImages = editedImages.map((i) => i.slice(1));

  const uploadDir = "public/products";
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  const images = [];

  if (req.files) {
    req.files.image = !req.files.image.length
      ? [req.files.image]
      : req.files.image;
    for (let i = 0; i < req.files.image.length; i++) {
      const image = req.files.image[i];
      let uploadPath = __dirname + "/../public/products/" + image.name;

      await new Promise((resolve) => {
        image.mv(uploadPath, (err) => {
          if (err) throw err;
          console.log(image);
          if (!err) images.push(`products/${image.name}`);
          resolve(true);
        });
      });
    }
  }
  product.images = [...editedImages, ...images];

  product.name = req.body.name;
  product.model_number = req.body.model_number
  product.description = req.body.description;
  product.category_id = req.body.category;
  product.size = req.body.size;
  product.price = req.body.price
  product.color = req.body.color
  product.material = req.body.material
  product.material_type = req.body.material_type
  product.brand = req.body.brand
 
  const itemData = await product.save();
  console.log(itemData);
       
       if (itemData) {
 
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
        const userData = await Item.findByIdAndUpdate({_id:id},{$set:{is_available:false}});
        if(userData)     
        res.redirect('/admin/additems');
        
     } catch (error) {
        
     }

}

const showItem = async(req,res)=>{
    try {
        let id = req.params.id;
        const userData = await Item.findByIdAndUpdate({_id:id},{$set:{is_available:true}});
        if(userData)     
        res.redirect('/admin/additems');
        
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
       
        console.log(req.file);
    
            const category = new Category({
                owner:req.session.user_id,
                name:name,
                size:size,
                color:color,
                material:material,
                material_type:material_type,
                brand:brand,
          
            });
            const uploadDir = "public/uploads";

            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
          
            const images = [];
          
            req.files.images = !req.files.images.length
              ? [req.files.images]
              : req.files.images;
              console.log(req.files);
            for (let i = 0; i < req.files.images.length; i++) {
              const image = req.files.images[i];
              let uploadPath = __dirname + "/../public/uploads/" + image.name;
              console.log(uploadPath);
          
              await new Promise((resolve) => {
                image.mv(uploadPath, (err) => {
                  if (err) throw err;
                 
                  if (!err) images.push(`uploads/${image.name}`);
                  resolve(true);
                });
              });
            }
            category.images = images;
            
          
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
        const catid = req.body.catid;
        let new_image ="";

        const name = req.body.name;
        // const size = req.body.size;
        // const color = req.body.color;
        // const material = req.body.material;
        // const material_type = req.body.material_type;
        // const brand = req.body.brand;

        if(req.file){
            new_image = req.file.filename;
          fs.unlinkSync('./uploads/'+ req.body.old_image)
  
        }
        else{
            new_image = req.body.old_image
        }

        const categoryData =await Category.findByIdAndUpdate({_id:catid},{$set:{name:name,images:new_image}})
       console.log(categoryData);
       if (categoryData) {
 
        res.redirect('/admin/addcategory')
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
        const userData = await Category.findByIdAndUpdate({_id:id},{$set:{is_available:false}});
        
       if(userData)
        res.redirect('/admin/addcategory')
        
        
     } catch (error) {
        console.log(error.message);
     }
    
  
}
const showCategory = async(req,res)=>{
    try {
        let id = req.params.id;
        const userData = await Category.findByIdAndUpdate({_id:id},{$set:{is_available:true}});
        if(userData)     
        res.redirect('/admin/addcategory');
        
     } catch (error) {
        
     }

    
}
//end
const editUser = async(req,res)=>{

    try {
        const userId = req.params.userid;
        const userData = await User.findOne({_id:userId})
        
       
        if (userData) {
            
            res.render('edituserView.ejs',{user:userData})

        } else {
            res.redirect('/admin/showusers')
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

const banUser = async(req,res)=>{
    try {
        const userId = req.params.userid;
        const userData = await User.findByIdAndUpdate({_id:userId},{$set:{is_active:0}})
        console.log(userData);
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

const removeBanUser = async(req,res)=>{
    try {
        const userId = req.params.userid;
        const userData = await User.findByIdAndUpdate({_id:userId},{$set:{is_active:1}})
        console.log(userData);
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
    showItem,
    addCategory,
    addCategorySave,
    editCategory,
    updateCategory,
    deleteCategory,
    showCategory,
    editUser,
    updateUser,
    banUser,
    removeBanUser,
    searchUser
}