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
        res.render('products/product-edit',{theProduct:productFromDB})
    })
    .catch(err=>next(err))
})
router.post('/:id/edit',fileUploader.fields([{name: 'pictureURL0', maxCount: 1},{name: 'pictureURL1', maxCount: 1},{name: 'pictureURL2', maxCount: 1},{name: 'pictureURL3', maxCount: 1}]),(req,res,next)=>{
   Product.findById(req.params.id)
   .then(productFromDB=>{
       const picArray=[];
       productFromDB.productName = req.body.productName;
       productFromDB.description = req.body.description;
       productFromDB.price = req.body.price;
       productFromDB.measurements = req.body.measurements;
       productFromDB.size = req.body.size;
    //    if new image is chosen then update the matching photo
    console.log('req.files', req.files)
    console.log('productFromDB.pictureURL[0]', productFromDB.pictureURL[0])

        if(req.files.pictureURL0[0].path){
            productFromDB.pictureURL0= req.files.pictureURL0[0].path;
        } else {
            productFromDB.pictureURL0 =  productFromDB.pictureURL[0];
        }
        if(req.files.pictureURL1[0].path){
            productFromDB.pictureURL1= req.files.pictureURL1[0].path;
        } else {
            productFromDB.pictureURL1 =  productFromDB.pictureURL[1];
        }
        if(req.files.pictureURL2[0].path){
            productFromDB.pictureURL2= req.files.pictureURL2[0].path;
        } else {
            productFromDB.pictureURL2 =  productFromDB.pictureURL[2];
        }
        if(req.files.pictureURL3[0].path){
            productFromDB.pictureURL3= req.files.pictureURL3[0].path;
        } else {
            productFromDB.pictureURL3 =  productFromDB.pictureURL[3];
        }
        picArray.push(productFromDB.pictureURL0,productFromDB.pictureURL1,productFromDB.pictureURL2,productFromDB.pictureURL3)
        productFromDB.pictureURL=picArray;
        
       productFromDB.save()
       .then(()=>res.redirect(`/products/${productFromDB._id}`))
       .catch(err=>next(err))
   })
   .catch(err=>next(err))
})

/////////////////////////////////////////////////////////
////////////////////DELETE A PRODUCT///////////////////////
////////////////ONLY VISIBLE TO ADMIN //////////////////
router.get('/:id/delete',(req,res,next)=>{
    Product.findByIdAndRemove(req.params.id)
    .then(()=>res.redirect('/products'))
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