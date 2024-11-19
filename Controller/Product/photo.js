const express = require("express");
const { query } = require("../../db");

const router = express.Router();

router.get("/photo/:id", async (req, res) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10); 

    if (isNaN(numericId)) {
        return res.status(400).json({ error: "Неправильний формат ID" });
    }

    try {
        const result = await query(
            `SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo,
                    i.image, i.hoverImage, i.image2, i.image3, c.category
             FROM products p
             LEFT JOIN image i ON p.id_img = i.id_image
             JOIN category c ON p.id_category = c.id_category
             WHERE p.id_products = ?`, [numericId] 
        );
        if (result.length === 0) {
            return res.status(404).json({ error: "Продукт не знайдено" });
        }
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Не вдалося отримати продукт" });
    }
});


module.exports = router;
