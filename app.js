const path = require('path');

//importing our 3rd party Packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

//importing our route handlers we define in "routes" folder
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

//importing our error handler
const errorController = require('./controllers/error');

//importing our User model we've defined in mongo
const User = require('./models/user');

//define your MONGO_URI which you need to connect your mongo client to your app
const MONGODB_URI = 'mongodb://<your_mongodb_usename>:<your_password>@cluster0-shard-00-00.louoq.mongodb.net:27017,cluster0-shard-00-01.louoq.mongodb.net:27017,cluster0-shard-00-02.louoq.mongodb.net:27017/<database_name>?ssl=true&replicaSet=atlas-2uvw8h-shard-0&authSource=admin&retryWrites=true&w=majority'

const app = express();

//defining an collection in our mongoDB which will store our users' session
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

//defing our token handler
const csrfProtection = csrf();

//defining the destination folder for storing users' trying to upload and normalize filenames
var fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, './images')
},
filename: function (req, file, cb) {
  cb(null, file.originalname + '-' + Date.now() + '.' + path.extname(file.originalname));
  }
});

//filtering the users' uploading files and recieve only PNG , JPG and JPEG files
const fileFilter = (req , file , cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null , true)
  } else {
    cb(null , false)
  }
}

//setting the ejs as our template engines
app.set('view engine', 'ejs');
app.set('views', 'views');

//define our body-parser and multer and use them as middlewares 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage , fileFilter: fileFilter}).single('image'));

//define 'public' folder as static then we will be able to use our css files we need in our views
app.use(express.static(path.join(__dirname, 'public')));
//we define "images" folder as a static which we will use as destination folder for incomming users' images upload
app.use('/images', express.static(path.join(__dirname, 'images')));

//declaring our sessions' storage setting
app.use(session({
  secret: 'my secret',
  resave: false , 
  saveUninitialized: false,
  store: store
}))
 
//using csrftoken middleware for authenticated users' token logic
app.use(csrfProtection);
//using flash() as middleware for generating errors once the user submits an invalid inputs in the forms 
app.use(flash());

//check if the user is authenticated or not, and if so, we will hold the user in the req
app.use((req, res, next) =>{
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user =>{
      if(!user){
        return next()
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

//if the user is authenticated we will save the loggedIn sitution and its token locally
app.use((req , res , next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

//handling our requsts by passing them through our routes handler files
app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

//handling our errors
app.use(errorController.get500);
app.use(errorController.get404);

//handle all of errors
app.use((error , req , res , next)=>{
  res.status(500).render('500', { 
    pageTitle: 'an error occured', 
     path: '/500',
     isAuthenticated: (req.session) ? req.session.isLoggedIn : false
  });
})

//connecting our app to mongo client
mongoose.connect(MONGODB_URI)
  .then(result =>{
    console.log('Connected');
    app.listen(3000);
  })
  .catch(err =>{
      console.log(err);
      res.redirect('/500')
  }); 