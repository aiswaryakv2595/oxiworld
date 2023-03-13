
const isLogin = async(req,res,next)=>{
    try {
       
        if(req.session.user1 ){
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
        if (req.session.user1) {
            
                res.redirect('/profile')
          
        }  
        else{
            next();
        }
       
    } catch (error) {
        console.log(error.message);
    }
   
}


module.exports= {
    isLogin,
    isLogout,
 
}