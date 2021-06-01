const express = require('express');
const router  = express.Router();
const Product = require('../models/Product.model')
/* GET home page */
router.get('/', (req, res, next) => {
  Product.find()
  .then(productsFromDB =>{
    const random = Math.floor(Math.random()*productsFromDB.length);
    res.render('index',{theProduct:productsFromDB[random]});
  })
  .catch(err=>next(err))
});

router.get('/about',(req,res,next)=>{
  res.render('about')
})

module.exports = router;
