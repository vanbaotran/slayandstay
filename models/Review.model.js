const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  orderId: {type: mongoose.Schema.Types.ObjectId, ref:'Order'},
  rating: Number,
  subjectLine: String,
  reviewDetails: String
},{timestamps:true})

module.exports = mongoose.model('Review',reviewSchema)