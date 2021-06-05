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
//BONUS: POP-UP 'ADDED TO BAG'/CONTINUE SHOPPING/CHECK OUT

/////BUY NOW/////////
router.get('/:id/orders',(req,res,next)=>{
    //if there is no product in shopping cart, then add to cart then check out 
    if (!req.session.cart){
        req.session.cart = [req.params.id]
        Product.findById(req.params.id)
        .then(productFromDB=>{
            Order.create({
                productId: productFromDB._id,
                userId: req.session.currentUser._id, 
                total: productFromDB.price ,
            })
            .then(order=>{
                console.log('shopping cart',req.session.cart)
                console.log('req.session',req.session)
                console.log('order newly created',order)
                req.session.order = order;
                console.log('session.order:',req.session.order)
                res.render('orders/shopping-cart',{theOrder :order})
            })
            .catch(err=>next(err))
        })
        .catch(err=>next(err))
    } else {   //if there are already products in the shopping cart, add one by one to the order after creating the order
        //make sure all items are non-repeated
        req.session.cart.push(req.params.id) 
        let productsArray = req.session.cart.filter((el)=>req.session.cart.indexOf(el)===req.session.cart.lastIndexOf(el))
        console.log('products Array', productsArray)
        //1. create an order with the last item (:id) in shopping cart
        Product.findById(req.params.id)
        .then(productFromDB=>{
            console.log('req.session',req.session)
            Order.create({
                productId: productFromDB._id,
                userId: req.session.currentUser,
                total: productFromDB.price ,
            })
            .then(orderFromDB=>{
                let total = 0;
        //2. Running a loop to calculate the total
                for (let i=0; i<productsArray.length;i++){
                    Product.findById(productsArray[i])
                    .then(productFromDB=>{
                        total+=productFromDB.price
                        console.log('total',total) 
                    })    
                    .catch(err=>next(err))
                }
                console.log('total',total)  
                orderFromDB.productId = productsArray;
                orderFromDB.total = total;
        //3. Save the update of the order
                orderFromDB.save()
                .then(orderFromDB=>{
                    console.log('order created',orderFromDB)
                    req.session.order = orderFromDB;
                    res.render('orders/shopping-cart',{theOrder: orderFromDB})
                })
                .catch(err=>next(err))
            })
            .catch(err=>next(err))
        })
        .catch(err=>console.log('error when creating order',err))            
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
    


module.exports = router;