const express = require('express');
const router  = express.Router();
const Product = require('../models/Product.model')
/* GET home page */
router.get('/', (req, res, next) => {
  Product.find()
  .then(productsFromDB =>{
    const random = Math.floor(Math.random()*productsFromDB.length);
    // const $arrowLeft = document.querySelector('arrow-left')
    // const $arrowRight = document.querySelector('arrow-right')
    // $arrowLeft.onclick = function clickLeft() {random--}
    // $arrowRight.onclick = function clickRight() {random++}
    // console.log('random:',random)
    res.render('index',{theProduct:productsFromDB[random]});
  })
  .catch(err=>next(err))
});

router.get('/about',(req,res,next)=>{
  res.render('about')
})

////////QUICK NAVIGATION ROUTES//////////
// display shipping info
router.get('/shipping', (req, res) => res.render('shipping'));
//returns
router.get('/returns', (req, res) => res.render('returns'));
//terms& conditions
router.get('/terms-and-conditions', (req, res) => res.render('terms-and-conditions'));
//contact us
router.get('/contact-us', (req, res) => res.render('contact-us'));


//
module.exports = router;
