const express = require('express');
const router = express.Router();
const db = require('../../db'); 

router.get('/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const results = await db.query(
            `SELECT p.id_products AS id, p.name, p.price, p.description, i.image 
             FROM products p 
             JOIN image i ON p.id_img = i.id_image 
             WHERE p.id_products = ?`,
            [productId]
        );

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Товар не знайдено' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;
