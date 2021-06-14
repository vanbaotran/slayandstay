const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
// const session = require('express-session')
const User = require('../models/User.model')
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const fileUploader = require('../configs/cloudinary.config');


///////BEGINNING AUTHENTICATION//////////////////////
/////////////////Signup Routes///////////////////////
//PUBLIC
// .get() route ==> to display the signup form to users
router.get('/signup', (req, res) => res.render('auth/signup'));

// .post() route ==> to process form data
router.post('/signup', fileUploader.single('pictureURL'),(req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email |!password) {
    res.render('auth/signup', { errorMessage: 'Make sure to fill out all the fields!' });
    return;
  }

const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
if (!regex.test(password)) {
  res
    .status(500)
    .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
  return;
}
User.findOne({email})
  .then(user=>{
    if (user){
      res.render('auth/signup',{errorMessage:'The email already exists, please login!'})
      return;
    }
 // 1. hash password
    const hashedPassword = bcrypt.hashSync(password, salt)
    let picURL;
    if (typeof req.file ==='undefined'){
      picURL = 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg'
    } else {
      picURL = req.file.path;
    }
  // 2.put data to database
      User.create({
        firstName,
        lastName,
        email,
        pictureURL:picURL,
        passwordHash: hashedPassword
      })
      .then(user => {
        req.session.currentUser = user;
        console.log('Newly created user is: ', user);
        res.render('users/user-profile',{user});
        console.log(req.file)
      })
      .catch(error => next(error))
      })
  .catch(err=>next(err))
});


module.exports = router;



//////////LOGIN/////////////////
//REGISTERED

//.get() route ==> to display log in form to users

router.get('/login', (req, res) => {
  if(req.session.currentUser){
    res.redirect('/userprofile')
  }
  res.render('auth/login',{errorMessage: req.flash('Please log in or sign up!')})});

//.post() form data is sent
router.post('/login', (req, res, next) => {
  console.log('SESSION =====> ', req.session);
  const { email, password } = req.body;
 
  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }
 
  User.findOne({ email})
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'Email is not registered. Please sign up if you do not have an account.' });
        return;
      } else if (bcrypt.compareSync(password, user.passwordHash)) {
        req.session.currentUser = user;
        res.render('users/user-profile',{user})
        //if the shopping cart is not empty, redirect to /checkout
        if(req.session.cart){
          res.redirect('/checkout')
        }
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
});

router.get('/userprofile',(req,res)=>{
  console.log('USER UPDATED', req.session.currentUser)
  res.render('users/user-profile',{user:req.session.currentUser})
})

router.get('/userprofile/edit',(req,res,next)=>{
  if (req.session.currentUser){
    User.findById(req.session.currentUser._id)
    .then(user=>{
      res.render('users/profile-edit',{user})
    })
    .catch(err=>next(err))
  } else {
    res.redirect('/login')
  }

})
router.post('/userprofile/edit',fileUploader.single('pictureURL'),(req,res,next)=>{
  const { firstName, lastName, email, password } = req.body;
  User.findById(req.session.currentUser._id)
  .then(userFromDB=>{
    userFromDB.firstName = req.body.firstName;
    userFromDB.lastName = req.body.lastName;
    userFromDB.email = req.body.email;
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)
    userFromDB.passwordHash = hashedPassword;
    console.log('hinh cu',userFromDB)
    if (typeof req.file !=='undefined'){
    //   userFromDB.pictureURL = 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg'
    // } else {
      userFromDB.pictureURL = req.file.path;
    }
    userFromDB.save()
    .then(()=>{
      console.log('CURRENT USER',req.session.currentUser)
      userFromDB = req.session.currentUser;
      res.redirect('/userprofile')
    })
    .catch(err=>next(err))
  })
  .catch(err=>next(err))
})


// LOGOUTTTTTT
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});
/////////END AUTHENTICATION////////////////
///WISHLIST ROUTE///
////LOGGED IN
router.get('/wishlist',(req,res,next)=>{
  console.log('USER:',req.session.currentUser)
  if (req.session.currentUser){
    User.findById(req.session.currentUser)
    .populate('wishlist')
    .then(user=>{
      const wishlist = user.wishlist
      console.log('USER FOUND WITH WISHLIST',user)
      if (wishlist.length>0) {
        res.render('users/wishlist',{theWishlist:wishlist})
      } else {
        res.render('users/wishlist')
      }
    })
    .catch(err=>next(err))
  } else {
    res.redirect('/login')
  }
})





router.get('/wishlist', (req, res) => res.render('users/wishlist'));



module.exports = router;
