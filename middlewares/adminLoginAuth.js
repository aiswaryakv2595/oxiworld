
const isLogin = async(req,res,next)=>{
    try {
       
        if(req.session.admin_id ){
          next()
        }
        
         else {
            res.redirect('/admin/login')
        }        
      
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if (req.session.admin_id) {
            
                res.redirect('/admin/dashboard')
          
        }  
        else
        next();
    } catch (error) {
        console.log(error.message);
    }
   
}

const authPage = (permissions)=>{
    return(req,res,next) =>{
        const user = req.session.role
        console.log(user);
        if(permissions.includes(user)){
            next();
        }
        else{
            return res.status(401).send('you are not permitted')
        }
    }
}

module.exports= {
    isLogin,
    isLogout,
    authPage
}