// const multer = require('multer')
// const path = require('path')

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null,path.join(__dirname,'../public/products')),function(err,success){
//         if(err){
//             console.log(err);
//             throw err;
            
//         }
//       }
//     },
//     filename: (req, file, cb) => {
//         var ext =file.originalname.substr(file.originalname.lastIndexOf('.'))
//       cb(null,file.fieldname+'-'+Date.now()+'-'+ext)
//     }
//   })
// const upload = multer({
//   storage: storage,
 
// })
// module.exports = upload