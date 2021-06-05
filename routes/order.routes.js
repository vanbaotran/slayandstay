const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product.model')
const Order = require('../models/Order.model')

///////ADD TO BAG//////////
router.get('/:id/addtobag',(req,res,next)=>{
    console.log(req.params.id)
    //if shopping cart is not empty and the selected item is not already in the the cart
    if (req.session.cart && req.session.cart.includes(req.params.id)===false) {
        req.session.cart.push(req.params.id)
    } else if (!req.session.cart) { //if the cart is empty 
        req.session.cart = [req.params.id]
    } 
    console.log('req.session.cart',req.session.cart)
    console.log('req.session',req.session)
    res.redirect(`/products`)
    
}) 
//BONUS: POP-UP 'ADDED TO BAG'/CONTINUE SHOPPING/CHECK OUT--> use flash

/////BUY NOW/////////
router.get('/:id/orders',(req,res,next)=>{
    //make sure the client log in before placing an order
    if (!req.session.currentUser){
        res.render('auth/login',{errorMessage:'Please login to place an order! If you are not part of the family yet, please sign up'})
    }
    //if there is no product in shopping cart, then add to cart then check out 
    else if (!req.session.cart){
        req.session.cart = [req.params.id]
        Product.findById(req.params.id)
        .then(productFromDB=>{
            Order.create({
                productId: productFromDB._id,
                userId: req.session.currentUser._id, 
                total: productFromDB.price ,
            })
            .then(order=>{
                req.session.order = order;
                console.log('session.order:',req.session.order)
                res.redirect('shoppingcart')
            })
            .catch(err=>next(err))
        })
        .catch(err=>next(err))
    } else {   //if there are already products in the shopping cart, add one by one to the order after creating the order
        //make sure all items are non-repeated
        req.session.cart.push(req.params.id) 
        let productsArray = req.session.cart.filter((el)=>req.session.cart.indexOf(el)===req.session.cart.lastIndexOf(el))
        console.log('products Array', productsArray)
        let promises = [];
        productsArray.forEach(id=>promises.push(Product.findById(id)))   
        Promise.all(promises).then(products=>{
            let priceArray = products.map(el=>el.price)
            let total = priceArray.reduce((acc,el)=>acc+el)
            Order.create({
                productId: productsArray,
                userId: req.session.currentUser._id, 
                total: total,
            })
            .then(order=>{
                console.log('order just created',order)
                res.redirect('shoppingcart')
                req.session.order = order;
             
            })
        })
        .catch(err=>console.log('error when calculation total',err))
    }
})
router.get('/shoppingCart',(req,res,next)=>{
    Order.findOne({_id:req.session.order._id})
    .populate('productId')
    .then(currentOrder=>{
        res.render('orders/shopping-cart',{theOrder:currentOrder})  
    })
    .catch(err=>next(err))
})
router.get('/myorders',(req,res,next)=>{
    User.findById(req.session.currentUser)
    .then(()=>{
        Order.find()
        .then(orders=>{
            console.log('myorders', orders)
            res.render('orders/myorders',{myOrders: orders})
        })
    })
        
    
})

module.exports = router;