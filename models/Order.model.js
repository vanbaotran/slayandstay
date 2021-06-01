const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    productId: [{type: mongoose.Schema.Types.ObjectId, ref:'Product'}]
    userId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    total: Number,

}, {timestamps:true})

module.exports = mongoose.model('Order', orderSchema)