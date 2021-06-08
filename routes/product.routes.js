const express = require('express');
const router = express.Router();
const Product = require('../models/Product.model')
const fileUploader = require('../configs/cloudinary.config');
const { findOneAndUpdate } = require('../models/Product.model');
const User = require('../models/User.model');
const { request } = require('http');

/////////////////////////////////////////////////////////
/////////////////////PRODUCT-LIST///////////////////////
/////////////////////////////////////////////////////////
//PUBLIC - ROLE ADMIN TO BE DEFINED
//////CHECK ADMIN////////
// function checkAdmin(req,res,next){
//     if(req.session.currentUser.email===process.env.ADMIN){
//       next()
//     } else {
//       res.redirect('/products')
//     }
//   }
router.get('/',(req,res,next)=>{ 
    Product.find()
    .then(allProducts=>{
    res.render('products/products-list',{allProducts:allProducts})
    })
    .catch(err=>next(err))

})

/////////////////////////////////////////////////////////
////////////////////UPLOAD AN ITEM///////////////////////
/////////////////////////////////////////////////////////
//ROLE ADMIN TO BE DEFINED
router.get('/create', (req,res,next)=>{
    console.log('ROLE',req.session.currentUser)
    res.render('products/product-create')})

router.post('/create',fileUploader.fields([{name:'pictureURL',maxCount:4}]),(req,res,next)=>{
    const {productName, description, price, size,measurements}=req.body;

    if (!productName) {
        res.render('products/product-create', { errorMessage: 'Please provide the productName.' });
        return;
      }
    const picArray = req.files.pictureURL.map(el=>el.path)
    console.log(picArray)
    Product.create({
        productName,
        description,
        price,
        size,
        measurements,
        pictureURL: picArray,
    })
    .then(newProduct=>{
        console.log('Product newly listed:',newProduct)
        res.redirect('/products')
    })
    .catch(err=>next(err))
})
/////////END AUTHENTICATION////////////////
///WISHLIST ROUTE///
////LOGGED IN
router.get('/:id/favorite', (req,res,next) => {
    //if not logged in, redirect to /login
    if (!req.session.currentUser){
        res.redirect('/login')
    } else {//if LOGGED IN
        //setting up req.session.favorites
        // res.redirect(`/products/${req.params.id}`)
        const productId = req.params.id;
        if(!req.session.favorites){
            req.session.favorites=[productId]
        }
        //if logged in and the product wasn't in the wishlist => add to wishlist
        else if (req.session.favorites.includes(req.params.id)===false){
            req.session.favorites.push(productId)
            //if logged in and the product was already in the wishlist =>remove from wishlist
        } else if (req.session.favorites.includes(req.params.id)){
            let index = req.session.favorites.indexOf(req.params.id)
            req.session.favorites.splice(index,1)
        }
                Product.findById(productId)
                .then(product=>{   
                    User.findOneAndUpdate(req.session.currentUser._id,
                        {wishlist:req.session.favorites}
                        ,{new:true}
                        )
                    .then(user=>{
                        console.log('REQ.SESSION.FAVORITES',req.session.favorites)
                        console.log('WISHLIST',user)
                        if (user.wishlist.includes(req.params.id)){
                            favorite = true;
                            res.render('products/product-details',{favorite, theProduct:product })
                        } else {
                            res.render('products/product-details',{theProduct:product })
                        }
                        
                    })
                    .catch(err=>next(err))
                })
                .catch(err=>next(err))
    }
    
        // User.findOneAndUpdate(req.session.currentUser._id,
        //     {wishlist:req.session.favorites},{new:true}
  });
/////////////////////////////////////////////////////////
/////////////////////EDIT PRODUCT-DETAILS////////////////
/////////////////////////////////////////////////////////
//ROLE ADMIN TO BE DEFINED
router.get('/:id/edit',(req,res,next)=>{
    if(req.session.currentUser.email=process.env.ADMIN){
        Product.findOne({_id:req.params.id})
        .then(productFromDB=>{
            res.render('products/product-edit',{theProduct:productFromDB})
        })  
        .catch(err=>next(err))
    }
})
router.post('/:id/edit',fileUploader.fields([{name: 'pictureURL0', maxCount: 1},{name: 'pictureURL1', maxCount: 1},{name: 'pictureURL2', maxCount: 1},{name: 'pictureURL3', maxCount: 1}]),(req,res,next)=>{
   Product.findById(req.params.id)
   .then(productFromDB=>{
       productFromDB.productName = req.body.productName;
       productFromDB.description = req.body.description;
       productFromDB.price = req.body.price;
       productFromDB.measurements = req.body.measurements;
       productFromDB.size = req.body.size;
    //    if new image is chosen then update the matching photo
    console.log('req.files', req.files)
    console.log('productFromDB.pictureURL[0]', productFromDB.pictureURL[0])
        if (req.files.pictureURL0) {
            productFromDB.pictureURL.set(0,req.files.pictureURL0[0].path)
        }
        if (req.files.pictureURL1) {
            productFromDB.pictureURL.set(1,req.files.pictureURL1[0].path)
        }
        if (req.files.pictureURL2) {
            productFromDB.pictureURL.set(2,req.files.pictureURL2[0].path)
        }
        if (req.files.pictureURL3) {
            productFromDB.pictureURL.set(3,req.files.pictureURL3[0].path)
        }        
       productFromDB.save()
       .then(()=>{
           res.redirect(`/products/${productFromDB._id}`)
        })
       .catch(err=>next(err))
   })
   .catch(err=>next(err))
})

/////////////////////////////////////////////////////////
////////////////////DELETE A PRODUCT///////////////////////
////////////////ONLY VISIBLE TO ADMIN //////////////////
//ROLE ADMIN TO BE DEFINED
router.get('/:id/delete',(req,res,next)=>{
    Product.findByIdAndRemove(req.params.id)
    .then(()=>res.redirect('/products'))
    .catch(err=>next(err))
})
/////////////////////////////////////////////////////////
/////////////////////PRODUCT-DETAILS///////////////////////
/////////////////////////////////////////////////////////
//PUBLIC
router.get('/:id',(req,res,next)=>{
    const id=req.params.id;
    Product.findOne({_id: id})
    .then(productFromDB=>{
        res.render('products/product-details',{theProduct:productFromDB})
    })
})




module.exports = router;