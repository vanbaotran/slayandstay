const express = require('express');
const router = express.Router();
const Product = require('../models/Product.model')
const fileUploader = require('../configs/cloudinary.config');
const { findOneAndUpdate } = require('../models/Product.model');

/////////////////////////////////////////////////////////
/////////////////////PRODUCT-LIST///////////////////////
/////////////////////////////////////////////////////////
router.get('/',(req,res,next)=>{
    Product.find()
    .then(allProducts=>{
        res.render('products/products-list',{allProducts:allProducts})
    })
})

/////////////////////////////////////////////////////////
////////////////////UPLOAD AN ITEM///////////////////////
/////////////////////////////////////////////////////////

router.get('/create',(req,res,next)=>{
    // if (!req.session.currentUser){
    //     res.redirect('/login')
    //     return
    //   }
    res.render('products/product-create')
})
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
/////////////////////////////////////////////////////////
/////////////////////EDIT PRODUCT-DETAILS////////////////
/////////////////////////////////////////////////////////
router.get('/:id/edit',(req,res,next)=>{
    Product.findOne({_id:req.params.id})
    .then(productFromDB=>{
        console.log('product chosen',productFromDB)
        res.render('products/product-edit',{theProduct:productFromDB})
    })
    .catch(err=>next(err))
})
router.post('/:id/edit',(req,res,next)=>{
   Product.findById(req.params.id)
   .then(productFromDB=>{
       productFromDB.productName = req.body.productName;
       productFromDB.description = req.body.description;
       productFromDB.price = req.body.price;
       productFromDB.measurements = req.body.measurements;
       productFromDB.size = req.body.size;
       productFromDB.pictureURL=req.body.pictureURL;
       productFromDB.save()
       .then(()=>res.redirect(`/${productFromDB._id}`))
       .catch(err=>next(err))
   })
   .catch(err=>next(err))
})
/////////////////////////////////////////////////////////
/////////////////////PRODUCT-DETAILS///////////////////////
/////////////////////////////////////////////////////////

router.get('/:id',(req,res,next)=>{
    const id=req.params.id;
    Product.findOne({_id: id})
    .then(productFromDB=>{
        console.log('the product found',productFromDB)
        res.render('products/product-details',{theProduct:productFromDB})
    })
})

module.exports = router;