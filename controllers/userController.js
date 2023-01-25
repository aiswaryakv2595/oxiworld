const User = require('../models/userModel')
const bcrypt = require('bcrypt')

const securePassword = async(password)=>{
    try {
       const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

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
      const userData = await User.findOne({email:email});
    
    //   console.log(userData);
       
      if (userData) {

      const passwordMatch = await bcrypt.compare(password,userData.password)
      if (passwordMatch) {
        req.session.user_id = userData._id;
        req.session.is_admin = userData.is_admin;
        req.session.role = userData.role
       
        console.log(userData.is_admin);
        if (userData.is_admin == 1) {
            res.redirect('/dashboard')
           
            
        } else {           
            res.redirect('/profile')
        }
        
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

const profile = async(req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id})
        console.log(userData);
        res.render('profile',{user:userData})
        
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
               
               res.redirect('/login');
            }
         })
      
        
    } catch (error) {
        console.log(error.message);
    }

}

const register = async(req,res)=>{
    try {
        res.render('register')
        
    } catch (error) {
        console.log(error.message);
    }

}

const saveUser = async(req,res)=>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const gender = req.body.gender;
        const password = await securePassword(req.body.password);
        const confirmPassword =req.body.confirmPassword
        if(!gender){
            res.render('register',{message:'Select one'})
           
        }
        const validate = await User.findOne({$or:[{name:name},{email:email}]})
        if(validate){
            res.render('register',{message:'user already exist'})
        }
       else if (req.body.password == confirmPassword) {
            const user = new User({
                name:name,
                email:email,
                password:password,
                phone:phone,
                gender:gender,                   
                role:"user",
                        
            });
    
          const userData = await user.save();
          if (userData) {
            res.redirect('/login')
            
          } else {
            res.render('register',{message:'Registration failed'})
          }
            
        }
        else{
            res.render('register',{message:'Password should match'})
        }
    } catch (error) {
        console.log(error.message);
    }

}


module.exports = {
    loadLogin,
    verifyLogin,
    profile,
    logout,
    register,
    saveUser,
}