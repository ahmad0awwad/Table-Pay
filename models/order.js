
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    tableNumber: { type: String, required: true },
    items: [
        {
            productId: { type: String },
            name: { type: String },
            price: { type: String },
            quantity: { type: Number },
        }
    ],
    totalAmount: { type: Number},
    paymentMethod: { type: String},
    status: { type: String, default: 'pending' }, // e.g., pending, in-progress, completed
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
