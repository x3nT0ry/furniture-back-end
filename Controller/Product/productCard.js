
const express = require('express');
const router = express.Router();
const db = require('../../db'); 

router.get('/card/:id', async (req, res) => {
    const { id } = req.params;
    try {
       
        const productQuery = `
            SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo, p.tables,
                   i.image, i.hoverImage, c.category AS categoryName
            FROM products p
            LEFT JOIN image i ON p.id_img = i.id_image
            LEFT JOIN category c ON p.id_category = c.id_category
            WHERE p.id_products = ?
        `;
        const product = await db.query(productQuery, [id]);

        if (product.length === 0) {
            return res.status(404).json({ message: "Продукт не знайдено" });
        }

        res.json(product[0]); 
    } catch (error) {
        console.error("Помилка при отриманні продукту:", error);
        res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
});

module.exports = router;
