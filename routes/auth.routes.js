const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const User = require('../models/User.model')
const bcryptjs = require('bcryptjs');
const salt = bcryptjs.genSaltSync(10)


///////BEGINNING AUTHENTICATION//////////////////////
/////////////////Signup Routes///////////////////////
// .get() route ==> to display the signup form to users
router.get('/signup', (req, res) => res.render('auth/signup'));


// .post() route ==> to process form data
router.post('/signup', (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

if (!firstName || !lastName || !email || !password) {
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


 // 1. hash password
  const hashedPassword = bcryptjs.hashSync(password, salt)
  console.log(`Password hash: ${hashedPassword}`);  

  router.get('/user-profile', (req, res) => {
    res.render('users/user-profile');
  });
//{ userInSession: req.session.currentUser }

// 2.put data to database
  User.create({
    firstName,
    lastName,
    email,
    passwordHash: hashedPassword
  })
  
    .then(user => {
      console.log('Newly created user is: ', user);
      res.redirect('/user-profile');
    })
    
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
          res.status(500).render('auth/signup', { errorMessage: error.message });
        } else if (error.code === 11000) {
         res.status(500).render('auth/signup', {
         errorMessage: 'Email is already in use'
          });
      }
      else {
          next(error);
      }
    })

    
});

//////////LOGIN/////////////////

//.get() route ==> to display log in form to users

router.get('/login', (req, res) => res.render('auth/login'));

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
 
  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'Email is not registered. Please sign up if you do not have an account.' });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        req.session.currentUser=user;
          res.render('users/user-profile', { user});
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));

// LOGOUTTTTTT
    router.post('/logout', (req, res) => {
      req.session.destroy();
      res.redirect('/');
    });




/////////END AUTHENTICATION////////////////





});

module.exports = router;
