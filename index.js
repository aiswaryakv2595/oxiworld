const express = require('express')
const app = express()

const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://localhost:27017/oxiworld');

const isAdmin = require('./middlewares/isAdmin')
app.use(isAdmin.isAdmin)

// for admin routes
const adminRoutes = require('./routes/adminRoutes')
app.use('/admin',adminRoutes)

//for user routes
const userRoutes = require('./routes/userRoutes')
app.use('/',userRoutes)


app.use(express.static('public'));
app.listen(3000, function(){
    console.log('server is ready in 3000');
})