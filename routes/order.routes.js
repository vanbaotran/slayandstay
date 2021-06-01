const express = require('express');
const { Model } = require('mongoose');
const router = express.Router();
const Product = require('../models/Product.model')
const Order = require('../models/Order.model')

router.get('/:id/orders/add',(req,res,next)=>{
    const total = 0;
    Product.findById(req.params.id)
    .populate('product')
    .then(productFromDB=>{
        total+= productFromDB.price;
        console.log('item added to cart', productFromDB)
        console.log('total', total)
        Order.create({
            productId: productFromDB._id,
            userId: req.session.currentUser._id, 
            total: total,
        })
        .then(()=>res.render('orders/shopping-cart',{theProduct:productFromDB}))
        .catch(err=>next(err))
    })
    .catch(err=>next(err))
})

module.exports = router;