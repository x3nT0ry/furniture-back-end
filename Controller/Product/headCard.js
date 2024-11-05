const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const results = await db.query('SELECT name, price, description FROM products WHERE id_products = ?', [productId]);

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
