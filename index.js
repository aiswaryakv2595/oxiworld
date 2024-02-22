const express = require('express')
const app = express()
const session = require('express-session');

const cookieParser = require("cookie-parser");
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose');


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser());
const config = require('./config/config')

app.set('view engine', 'ejs')

const oneDay = 1000 * 60 * 60 * 24;
const adminSession = session({
    name: 'adminSessionId',
    secret: config.sessionSecretAdmin,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
});
  
const userSession = session({
    name: 'userSessionId',
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { 
      secure: true,
      maxAge: oneDay 
    },
});

// app.use(function(req, res, next) {
//     if (!req.user)
//         res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     next();
// });


const isAdmin = require('./middlewares/isAdmin')
app.use(isAdmin.isAdmin)

// for admin routes
const adminRoutes = require('./routes/adminRoutes')
app.use('/admin',adminSession,adminRoutes)

//for user routes
const userRoutes = require('./routes/userRoutes')
app.use('/',userSession,userRoutes)
const productRoutes = require('./routes/productRoutes')
app.use('/',userSession,productRoutes)
const categoryRoutes = require('./routes/categoryRoutes')
app.use('/admin',adminSession, categoryRoutes)
const itemRoutes = require('./routes/itemRoutes')
app.use('/admin',adminSession,itemRoutes)


app.use(express.static('public'));
app.use((req, res, next) => {
    res.status(404).render('404.ejs');
  });
  const port = process.env.PORT || 3000
  mongoose
  .connect(process.env.ATLAS)
  .then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
      });
    })
    .catch((err) => console.log(err));