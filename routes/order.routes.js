const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User.model')
const Product = require('../models/Product.model')
const Order = require('../models/Order.model')
const Review = require('../models/Review.model')
///////ADD TO BAG//////////
//PUBLIC
router.get('/:id/addtobag',(req,res,next)=>{
    console.log(req.params.id)
    //if shopping cart is not empty and the selected item is not already in the the cart
    if (req.session.cart && req.session.cart.includes(req.params.id)===false) {
        req.session.cart.push(req.params.id)
    } else if (!req.session.cart) { //if the cart is empty 
        req.session.cart = [req.params.id]
    } 
    res.redirect(`/products/${req.params.id}`)  
}) 
//////FUNCTION
function calculateTotal(productsArray){

    return new Promise(function (resolve, reject) {
        let promises = [];
        productsArray.forEach(id=>promises.push(Product.findById(id)))   
        Promise.all(promises)
            .then(products=>{
                let priceArray = products.map(el=>el.price)
                let total = priceArray.reduce((acc,el)=>acc+el)
                resolve(total)
            })
            .catch(err=>reject(err))
    })  
}
//BONUS: POP-UP 'ADDED TO BAG'/CONTINUE SHOPPING/CHECK OUT--> use flash
//PUBLIC
router.get('/:id/buynow',(req,res,next)=>{
    if (req.session.cart && req.session.cart.includes(req.params.id)===false) {
        req.session.cart.push(req.params.id)
    } else if (!req.session.cart) { //if the cart is empty 
        req.session.cart = [req.params.id]
    } 
    res.redirect('/shoppingcart')
})
/////BUY NOW/////////POP-UP CHECKOUT 
//PUBLIC BUT WILL ASK TO LOG IN
router.get('/checkout',(req,res,next)=>{
    //make sure the client log in before placing an order
    if (!req.session.currentUser){
        res.render('auth/login',{errorMessage:'Please login to place an order! If you are not part of the family yet, please sign up'})
    //if there is no product in shopping cart, then add to cart then check out 
    } else {   //if there are already products in the shopping cart, add one by one to the order after creating the order
        //make sure all items are non-repeated
        let productsArray = req.session.cart.filter((el)=>req.session.cart.indexOf(el)===req.session.cart.lastIndexOf(el))
        console.log('products Array', productsArray)
        calculateTotal(productsArray)
            .then((total)=>{
                Order.create({
                    productId: productsArray,
                    userId: req.session.currentUser._id, 
                    total: total,
                })
                .then(order=>{
                    console.log('order just created',order)
                    res.redirect('/orderconfirmation');
                })
                .catch(err=>console.log('error when creating new order',err))
            })
            .catch(err=>next(err))       
    }
})
//PUBLIC
router.get('/shoppingcart',(req,res)=>{
    if (req.session.cart){
        let productsArray = req.session.cart.filter((el)=>req.session.cart.indexOf(el)===req.session.cart.lastIndexOf(el))
        console.log('products Array', productsArray)
        let promises = [];
        productsArray.forEach(id=>promises.push(Product.findById(id)))   
        Promise.all(promises)
        .then(products=>{
            let priceArray = products.map(el=>el.price)
            let total = priceArray.reduce((acc,el)=>acc+el) //repeating function calculateTotal because we also need data from products 
            res.render('orders/shopping-cart',{theProducts:products,total:total})
        })
        .catch(err=>console.log('error when retrieving Product info',err))
    }
})
//LOGGED IN
router.get('/orderconfirmation',(req,res,next)=>{
    if (req.session.currentUser){
        Order.findOne({userId:req.session.currentUser}).sort({createdAt:-1}) //tri en recuperant la derniere commande
        .populate('productId')
        .then(currentOrder=>{
            console.log('current Order', currentOrder)
            res.render('orders/order-confirmation',{theOrder:currentOrder})  
        })
        .catch(err=>next(err))
    } else {
        res.redirect('/')
    }
})
//LOGGED IN
router.get('/myorders',(req,res,next)=>{
    if (req.session.currentUser){
        Order.find({userId:req.session.currentUser})
        .populate('productId')
        .then(orders=>{
            let productsArray = orders.map(el=>el.productId)
            res.render('orders/my-orders',{myOrders: orders})
        })
        .catch(err=>next(err))
    } else {
        res.redirect('/')
    }
})
//LOGGED IN
router.get('/myorders/:id',(req,res,next)=>{
    if (req.session.currentUser){
        const orderId = req.params.id;
        Order.findById(orderId)
        .populate('productId')
        .then(orderFromDB=>{
            res.render('orders/order-details',{theOrder: orderFromDB})
        })
        .catch(err=>next(err))
    } else {
        res.redirect('/')
    }
})
////////SUBMIT A REVIEW//////////////
//LOGGED IN and HAVE AT LEAST AN ORDER
router.post('/myorders/:id/submitReview',(req,res,next)=>{
    if (req.session.currentUser){
        const {star, subjectLine, reviewDetails} = req.body;
        Review.create({
            orderId: req.params.id,
            subjectLine,
            rating: star,
            reviewDetails
        })
        .then(review=>{
            console.log('review newly created', review)
            Order.findById(req.params.id)
            .populate('productId')
            .then(order=>{
                res.render('orders/order-details',{theReview: review, theOrder:order})
            })
            .catch(err=>next(err))
        })
        .catch(err=>next(err))
    } else {
        res.redirect('/')
    }
})
/////////DELETE A REVIEW////////////////
router.get('/:id/deleteReview',(req,res,next)=>{
    if (req.session.currentUser){
        Review.findById(req.params.id)
        .populate('orderId')
        .then(review=>{
            Review.findByIdAndRemove(review._id)
            .then(()=>{
                res.redirect(`/myorders/${review.orderId._id}`)
            })
            .catch(err=>next(err))
        })
        .catch(err=>next(err))
    } else {
        res.redirect('/')
    }
})



module.exports = router;