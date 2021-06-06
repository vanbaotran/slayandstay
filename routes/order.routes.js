const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User.model')
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
router.get('/:id/buynow',(req,res,next)=>{
    if (req.session.cart && req.session.cart.includes(req.params.id)===false) {
        req.session.cart.push(req.params.id)
    } else if (!req.session.cart) { //if the cart is empty 
        req.session.cart = [req.params.id]
    } 
    res.redirect('/shoppingcart')
})
/////BUY NOW/////////POP-UP CHECKOUT 

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
                    res.redirect('/orderdetails');
                })
                .catch(err=>console.log('error when creating new order',err))
            })
            .catch(err=>next(err))       
    }
})
router.get('/shoppingcart',(req,res)=>{
    let productsArray = req.session.cart.filter((el)=>req.session.cart.indexOf(el)===req.session.cart.lastIndexOf(el))
    console.log('products Array', productsArray)
    let promises = [];
    productsArray.forEach(id=>promises.push(Product.findById(id)))   
    Promise.all(promises)
    .then(products=>{
        let priceArray = products.map(el=>el.price)
        let total = priceArray.reduce((acc,el)=>acc+el)
        res.render('orders/shopping-cart',{theProducts:products,total:total})
        // console.log('all products selected:', products) 
    })
    .catch(err=>console.log('error when retrieving Product info',err))
})
router.get('/orderdetails',(req,res,next)=>{
    Order.findOne({userId:req.session.currentUser}).sort({createdAt:-1}) //tri en recuperant la derniere commande
    .populate('productId')
    .then(currentOrder=>{
        console.log('current Order', currentOrder)
        res.render('orders/order-confirmation',{theOrder:currentOrder})  
    })
    .catch(err=>next(err))
})
router.get('/myorders',(req,res,next)=>{
    if (req.session.currentUser){
        Order.find({userId:req.session.currentUser})
        .populate('productId')
        .then(orders=>{
            let productsArray = orders.map(el=>el.productId)
            res.render('orders/my-orders',{myOrders: orders})
        })
        .catch(err=>next(err))
    }
})

module.exports = router;