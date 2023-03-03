const express = require('express')
const app = express()
const session = require('express-session');

const cookieParser = require("cookie-parser");

const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://localhost:27017/oxiworld');

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser());
const config = require('./config/config')

app.set('view engine', 'ejs')
const oneDay = 1000 * 60 * 60 * 24;
const adminSession = session({
    secret:config.sessionSecretAdmin,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
});
  
  const userSession = session({
    secret:config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
});

app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});


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
app.listen(3000, function(){
    console.log('server is ready in 3000');
})