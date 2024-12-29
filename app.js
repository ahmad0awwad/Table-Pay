const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const Category = require('./models/menu');
const Product = require('./models/menu');
const Order = require('./models/order');
const menuPath = path.join(__dirname, 'menu.json');
const app = express();
const PORT = 1000;
const { MongoClient } = require('mongodb');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app); 
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});






app.set('view engine', 'ejs');
app.set('public', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));





app.get('/menu', async (req, res) => {
    try {
        const { table } = req.query; // Extract the table number from the query parameter
        if (!table) {
            return res.status(400).send('Table number is required.');
        }

        const categories = await Category.find().lean(); // Fetch categories and products
        res.sendFile(path.join(__dirname, 'public', 'menu.html'));
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).send('Error fetching menu.');
    }
});



//لتحديث الداتا بيس من ملف menu.json
const isValidCategory = (category) => {
    return category._id && category.name && Array.isArray(category.products);
};
const syncJsonToDatabase = async () => {
    try {
        console.log('Syncing database with menu.json...');
        const jsonData = fs.readFileSync(menuPath, 'utf8');
        const { categories: jsonCategories } = JSON.parse(jsonData);

        console.log('Parsed categories from menu.json:', jsonCategories);

        // Fetch all categories from the database
        const dbCategories = await Category.find();

        // Sync categories
        for (const categoryData of jsonCategories) {
            if (!isValidCategory(categoryData)) {
                console.error(`Invalid category format: ${JSON.stringify(categoryData)}`);
                continue; // Skip invalid entries
            }

            let category = await Category.findById(categoryData._id);

            if (!category) {
                // Create a new category if it doesn't exist
                console.log(`Creating new category: ${categoryData.name}`);
                category = new Category(categoryData);
            } else {
                // Update existing category
                console.log(`Updating existing category: ${categoryData.name}`);
                category.name = categoryData.name;
                category.name_arabic = categoryData.name_arabic;
                category.description = categoryData.description;
                category.description_arabic = categoryData.description_arabic;

                // Sync products
                for (const productData of categoryData.products) {
                    const existingProduct = category.products.id(productData._id);

                    if (!existingProduct) {
                        console.log(`Adding new product: ${productData.name}`);
                        category.products.push(productData);
                    } else {
                        console.log(`Updating product: ${productData.name}`);
                        Object.assign(existingProduct, productData);
                    }
                }

                // Remove products not in the JSON data
                category.products = category.products.filter(product =>
                    categoryData.products.some(jsonProduct => jsonProduct._id === product._id)
                );
            }

            await category.save();
        }

        // Delete categories that are not in the JSON data
        for (const dbCategory of dbCategories) {
            if (!jsonCategories.some(jsonCategory => jsonCategory._id === dbCategory._id)) {
                console.log(`Deleting category: ${dbCategory.name}`);
                await Category.findByIdAndDelete(dbCategory._id);
            }
        }

        console.log('Database successfully synced with menu.json');
    } catch (error) {
        console.error('Error syncing menu.json to database:', error);
    }
};

syncJsonToDatabase();





// Watch for changes in `menu.json`
fs.watch(menuPath, async (eventType) => {
    if (eventType === 'change') {
        console.log('menu.json file changed. Syncing to database...');
        await syncJsonToDatabase();
    }
});
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}



mongoose.connect('mongodb://localhost:27017/menuDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });




app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        console.log(`Fetching product with ID: ${productId}`);

        // Ensure proper handling of ObjectId
        const objectId = mongoose.Types.ObjectId.isValid(productId) ? new mongoose.Types.ObjectId(productId) : productId;

        // Query the category to find the product in its products array
        const category = await Category.findOne({ 'products._id': objectId }, { 'products.$': 1 });
        if (!category || !category.products.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(category.products[0]); // Send the matched product
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// app.get('/admin/orders', async (req, res) => {
//     try {
//         const orders = await order.find().lean(); // Fetch all orders
//         res.render('admin', { orders }); // Render the admin dashboard
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         res.status(500).send('Error fetching orders.');
//     }
// });

app.get('/generate-qr/:table', async (req, res) => {
    const tableNumber = req.params.table;
    const menuUrl = `http://localhost:${PORT}/menu?table=${tableNumber}`;

    const qrCode = await qrcode.toDataURL(menuUrl);
    res.render('qr', { qrCode, tableNumber });
});
app.get('/api/menu', async (req, res) => {
    try {
        const categories = await Category.find().lean(); // Fetch categories and products
        res.status(200).json({ categories });
    } catch (error) {
        console.error('Error fetching menu data:', error);
        res.status(500).json({ error: 'Failed to fetch menu data' });
    }
});
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // Sort by latest orders
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


app.put('/api/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        io.emit('orderUpdated', updatedOrder); // Notify all admins
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});


app.post('/api/orders', async (req, res) => {
    try {
        const { orderId, tableNumber, items, totalAmount, paymentMethod, date } = req.body;
        console.log('Received order data:', req.body); // Log the incoming data
        if (!req.body.orderId || !req.body.tableNumber || !req.body.items || !req.body.totalAmount || !req.body.paymentMethod) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
       

        // Create and save the order
        const newOrder = new Order({
            orderId,
            tableNumber,
            items,
            totalAmount,
            paymentMethod,
            date,
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});







//apple pay 




server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});







