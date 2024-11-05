const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const results = await db.query('SELECT additionalInfo, tables FROM products WHERE id_products = ?', [productId]);

        if (results.length > 0) {
            const productData = results[0];

            try {
                productData.tables = JSON.parse(productData.tables);
            } catch (error) {
                console.error("Error parsing tables:", error);
                productData.tables = [];
            }

            try {
                productData.additionalInfo = JSON.parse(productData.additionalInfo);
            } catch (error) {
                console.error("Error parsing additionalInfo:", error);
                productData.additionalInfo = []; 
            }

            res.json(productData);
        } else {
            res.status(404).json({ message: 'Товар не знайдено' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;
