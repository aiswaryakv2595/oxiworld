
const isLogin = async(req,res,next)=>{
    try {
       
        if(req.session.user_id ){
            next()
        }
        
         else {
            res.redirect('/login')
        }        
      
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if (req.session.user_id) {
            
                res.redirect('/profile')
          
        }  
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