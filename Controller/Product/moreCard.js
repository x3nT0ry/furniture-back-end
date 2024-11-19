const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const productResults = await db.query(
            'SELECT additionalInfo FROM products WHERE id_products = ?',
            [productId]
        );

        if (productResults.length > 0) {
            const productData = productResults[0];

            try {
                productData.additionalInfo = JSON.parse(productData.additionalInfo);
            } catch (error) {
                console.error("Помилка парсингу additionalInfo:", error);
                productData.additionalInfo = [];
            }

            const characteristicsQuery = `
                SELECT c.title AS characteristic_title, co.title AS option_title
                FROM product_characteristics pc
                JOIN characteristic_options co ON pc.option_id = co.id
                JOIN characteristic c ON co.id_attr = c.id
                WHERE pc.product_id = ?
            `;
            const characteristicsResults = await db.query(characteristicsQuery, [productId]);

            productData.characteristics = characteristicsResults;

            res.json(productData);
        } else {
            res.status(404).json({ message: 'Товар не знайдено' });
        }
    } catch (error) {
        console.error("Помилка сервера:", error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;
