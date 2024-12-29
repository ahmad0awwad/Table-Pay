const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
    _id: String,
    name: String,
    name_arabic: String,
    Picture: String,
    images: [String],
    Video: String,
        "Item Code / SKU": String,
    Description_English: String,
    Description_Arabic: String,
    price: String
});



// Define the category schema
const categorySchema = new mongoose.Schema({
    _id: String, // Category ID
    name: String,
    name_arabic: String,
    description: String,
    description_arabic: String,
    products: [productSchema], 
}, { timestamps: true }); 



const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

module.exports = Category;
