const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
// const session = require('express-session')
const User = require('../models/User.model')
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);



///////BEGINNING AUTHENTICATION//////////////////////
/////////////////Signup Routes///////////////////////
// .get() route ==> to display the signup form to users
router.get('/signup', (req, res) => res.render('auth/signup'));


// .post() route ==> to process form data
router.post('/signup', (req, res, next) => {
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
    if (!user==null){
      res.render('auth/signup',{errorMessage:'The email already exists'})
    }
 // 1. hash password
    const hashedPassword = bcrypt.hashSync(password, salt)
    console.log(`Password hash: ${hashedPassword}`);  

  // 2.put data to database
      User.create({
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword
      })
      .then(user => {
        req.session.currentUser = user;
        console.log('Newly created user is: ', user);
        res.render('users/user-profile',{user});
      })
      .catch(error => next(error))
      })
  .catch(err=>next(err))
});

//////////LOGIN/////////////////

//.get() route ==> to display log in form to users

router.get('/login', (req, res) => res.render('auth/login',{errorMessage: req.flash('error')}));

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
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
});

router.get('/userprofile',(req,res)=>{
  res.render('users/user-profile',{user:req.session.currentUser})
})
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
    if (err) {
      // Something went wrong authenticating user
      return next(err);
    }
 
    if (!theUser) {
      // Unauthorized, `failureDetails` contains the error messages from our logic in "LocalStrategy" {message: '…'}.
      res.render('auth/login', { errorMessage: 'Wrong password or email ' });
      return;
    }
 
    // save user in session: req.user
    req.login(theUser, err => {
      if (err) {
        // Session save went bad
        return next(err);
      }
 
      // All good, we are now logged in and `req.user` is now set
      res.redirect('/');
    });
  })(req, res, next);
});

// LOGOUTTTTTT
router.post('/logout', (req, res) => {
  req.session.destroy();
  // req.logout();
  res.redirect('/');
});




/////////END AUTHENTICATION////////////////


module.exports = router;
