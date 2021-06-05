// User model here

const { Schema, model } = require('mongoose');

const userSchema = new Schema(
    {
      firstName: {
        type: String,
        trim: true,
        required: [true, 'name is required.'],
      },

      lastName: {
        type: String,
        trim: true,
        required: [true, 'last name is required.'],
      },
      email: {
        type: String,
        match:[/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true
      },
      passwordHash: {
        type: String,
        required: [true, 'Password is required.']
      },
      wishlist: 
        [ {type: Schema.Types.ObjectId, ref : 'Product'}],
      address: {
        type: String,
      },
      postalCode: {
        type: Number,
      },
      country: {
        type: String,
      },
      pictureURL: {
        type: String,
      }
    },
    {
      timestamps: true
    }
  );
   
  module.exports = model('User', userSchema);