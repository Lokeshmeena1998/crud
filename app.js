const express = require('express');
const path = require('path');
const multer = require('multer');
const productModel = require('./models/product');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('./uploads'));

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            callback(null, true)
        } else {
            callback(new Error('Only PNG, JPG, and JPEG files are supported'));
        }
    },
    limits: {
        fileSize: 1000000 // 1MB limit
    }
});

// Product Insertion API
app.post('/api/product/insert', upload.single('productImage'), async (req, res) => {
    const { productId, productName, productDescription, inActive } = req.body;
    const productImage = req.file.path; // Assuming 'productImage' is the name of the file input
    try {
        const createProduct = await productModel.create({ productId, productName, productDescription, productImage, inActive });
        res.status(201).json({ success: true, message: 'Product created successfully', data: createProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get Product by ID
app.get('/api/product/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const getProduct = await productModel.findById(productId);
        if (!getProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Product retrieved successfully', data: getProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Active Products with Pagination
app.get('/api/product/active', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;
    try {
        const activeProducts = await productModel.find({ inActive: false }).skip(skip).limit(perPage);
        res.status(200).json({ success: true, message: 'Active products retrieved successfully', data: activeProducts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Product by ID
app.put('/api/product/update/:productId', async (req, res) => {
    const { productId } = req.params;
    const { productName, productDescription, inActive } = req.body;
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(productId, { productName, productDescription, inActive }, { new: true });
        if (!updatedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete Product by ID
app.delete('/api/product/delete/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const deletedProduct = await productModel.findByIdAndDelete(productId);
        if (!deletedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully', data: deletedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
