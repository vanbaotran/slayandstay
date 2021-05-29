const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
	productName: String,
	pictureURL: {
        type: [String],
        required: true
    },
	description: String,
	price: Number,
	size: String,
	measurements :{
        type: String,
        // {
        //     Chest : Number,
        //     Shoulder: Number,
        //     SleeveLength: Number,
        //     backLength:Number
        // }    
    }
},{timestamps:true})

module.exports = mongoose.model('Product',productSchema)