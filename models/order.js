//importing mongoose package 
const mongoose = require('mongoose');

//creating an Schema objects
const Schema = mongoose.Schema;

//creating a Schema for Orders
const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
});
//saving and exporting model
module.exports = mongoose.model('Order', orderSchema);
