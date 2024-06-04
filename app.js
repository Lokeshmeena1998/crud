const express = require('express');
const bodyParser = require('body-parser');
const fs = require ('fs');
const path = require('path');
const multer = require('multer');
const product = require('./node_modules/product')




const app = express();
app.use(bodyParser.json());





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
            console.log('only  png , jpg & jpeg file supported')
            callback(null, false)
        }
    },
    limits: {
        filesize: 100000000000 //1000000 bytes=1MB
    }
});




// insert api
app.post('/api/product/insert') = async (req, res) => {
    const { productId, productName, productDescription, productImages, inActive } = req.body;
    try {
        const create_product = await product({ productId, productName, productDescription, productImages: req.file.filename, inActive })
        if (!create_product) {
            res.status(400).json({ sucess: "false", msg: 'Not insert the product' });
        } else {
            const data = await create_product.save();
            res.status(201).json({ sucess: "true", msg: 'your product are create sucsesfully', data: create_product });
        }
    }
    catch (error) {
        res.status(400).json({ result: "false", message: error.message });
    };
};



app.get('/api/product/:productId') = async (req, res) => {
    const { productId } = req.body
    try {
        const get_product = await product.findById({ productId })
        const data = await get_product.save()
        res.status(200).json({ result: "true", mess: " your id get sucsesfully ", data: data })
    } catch (error) {
        res.status(400).json({ result: "false", message: error.message })
    }
}



app.get('/api/product/active') = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const skip = (page - 10) * perPage
    try {
        const product = await product.find({ active: true }).skip(skip).limit(perPage)
        res.status(201).json({ result: "true", mess: "suc" })
    } catch (error) {
        res.status(500).json({ result: "false", message: error.message })
    }
}


app.put('/api/product/update/:productId') = async (req, res) => {
    const { productId, productName, productDescription, productImages, inActive } = req.body
    try {
        const product = await product.findById({ productId: productId })
        if (!product) {
            res.status(400).json({ result: "false", mess: "user ID not found" })
        }
        else {
            const product_update = await product.findByIdAndUpdate({ productId: productId }, { $set: { productId, productName, productDescription, productImages, inActive } })
            const user_data = await product_update.save()
            res.status(200).json({ result: "true", mess: " your product are sucsesfully upload", data: user_data })
        }
    }
    catch (error) {
        res.status(400).json({ result: "false", message: error.message })
    }
}




app.delete('/api/product/delete/:productId') = async (req, res) => {
    const { productId } = req.body
    try {
        const product_delete = await product.findOneAndDelete({ productId })
        const data = await product_delete.save()
        res.status(200).json({ result: "true", mess: " your product delete", data: data })


    } catch (error) {
        res.status(400).json({ result: "false", message: error.message })
    }
}


const port = process.env.port || 8000;
app.listen(port, function (error) {
    if (error) {
        console.log(error)
    } else {
        console.log("The server is running at port 8000");
    }
});   