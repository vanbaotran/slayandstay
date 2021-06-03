const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10)
const User = require('../models/user.model');


router.get('/signup',(req,res,next)=>{
  res.render('auth/signup')
})

router.post('/signup',(req,res,next)=>{
  const {firstName, lastName, email, password} = req.body;
  if (!firstName||!lastName||!email||!password){
    res.render('auth/signup',{errorMessage:'Please make sure to enter all information'})
  }
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(500)
      .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }
  const hashedPassword = bcrypt.hashSync(password,salt)
  console.log('hashedPassword: ',hashedPassword)
  User.create({
    firstName,
    lastName, 
    email, 
    passwordHash:hashedPassword
  })
  .then(user=>{
    console.log('user newly created', user)
    res.redirect('/');
  })
  .catch(error => {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render('auth/signup', { errorMessage: error.message });
    } else if (error.code === 11000) {
      res.status(500).render('auth/signup', {
         errorMessage: 'Username and email need to be unique. Either username or email is already used.'
      });
    } else {
      next(error);
    }
  })
})
router.get('/userprofile',(req,res,next)=>{
  res.render('users/user-profile',{user:req.session.currentUser})
})
router.get('/login',(req,res,next)=>{
  res.render('auth/login')
})
router.post('/login',(req,res,next)=>{
  const {email, password} = req.body;
  if (email===''||password===''){
    res.render('auth/login',{errorMessage:'Please enter both email and password'})
    return;
  }
  User.findOne({email})
  .then(user=>{
    if (!user){
      res.render('auth/login',{errorMessage:'Email is not registered. Try with another email'})
      return;
    } else if (bcrypt.compareSync(password, user.passwordHash)){
      req.session.currentUser = user;
      res.redirect('userprofile');
    } else {
      res.render('auth/login',{errorMessage:'Incorrect password'})
    }
  })  
})

// LOGOUTTTTTT
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;