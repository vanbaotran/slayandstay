const express = require('express');
const router = express.Router();
const Product = require('../models/Product.model')
const fileUploader = require('../configs/cloudinary.config');
const { findOneAndUpdate } = require('../models/Product.model');

/////////////////////////////////////////////////////////
/////////////////////PRODUCT-LIST///////////////////////
/////////////////////////////////////////////////////////
//PUBLIC - ROLE ADMIN TO BE DEFINED
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
router.get('/create',(req,res,next)=>{
    if (req.session.role = 'ADMIN'){
        res.render('products/product-create')
    }
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