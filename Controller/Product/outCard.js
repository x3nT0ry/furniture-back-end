const express = require("express");
const { query } = require("../../db");

const router = express.Router();

router.get("/products", async (req, res) => {
    try {
        const result = await query(
            `SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo, p.tables,
                    i.image, i.hoverImage, i.image2, i.image3, c.category
             FROM products p
             LEFT JOIN image i ON p.id_img = i.id_image
             JOIN category c ON p.id_category = c.id_category`
        );
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Не вдалося отримати продукти" });
    }
});



module.exports = router;
