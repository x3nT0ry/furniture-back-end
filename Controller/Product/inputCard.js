const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/getProducts', async (req, res) => {
    try {
        const products = await db.query(`
            SELECT p.id_products AS id, p.name, p.price, i.image, i.hoverImage 
            FROM products p 
            JOIN image i ON p.id_img = i.id_image
        `);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
