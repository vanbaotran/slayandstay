const express = require('express');
const { Model } = require('mongoose');
const router = express.Router();
const Product = require('../models/Product.model')
const Order = require('../models/Order.model')
const User = require('../models/user.model')

router.get('/:id/orders/add',(req,res,next)=>{
    const total = 0;
    Product.findById(req.params.id)
    .populate('product')
    .then(productFromDB=>{
        total+= productFromDB.price;
        console.log(req.session.currentUser)
        console.log('item added to cart', productFromDB)
        console.log('total', total)
        Order.create({
            productId: productFromDB._id,
            userId: req.session.currentUser._id, 
            total: total,
        })
        .then(order=>{
            console.log('order newly created', order)
            res.render('orders/shopping-cart',{newOrder:order})
        })
        .catch(err=>next(err))
    })
    .catch(err=>next(err))
})
///////ADD TO BAG//////////
router.get('/:id/addtobag',(req,res,next)=>{
    const cart = [];
    Product.findById(req.params.id)
    .populate('product')
    .then(productFromDB=>{
        console.log(productFromDB.produc)
    })
})


module.exports = router;