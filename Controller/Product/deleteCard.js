const express = require("express");
const router = express.Router();
const { query } = require("../../db");
const fs = require("fs");
const path = require("path");

router.delete("/deleteCard/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sqlGetImageId = "SELECT id_img FROM products WHERE id_products = ?";
        const results = await query(sqlGetImageId, [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const idImage = results[0].id_img;
        const sqlDeleteOrderItems = "DELETE FROM orderitems WHERE productId = ?";
        await query(sqlDeleteOrderItems, [id]);

        const sqlProduct = "DELETE FROM products WHERE id_products = ?";
        await query(sqlProduct, [id]);

        const sqlImage = "DELETE FROM image WHERE id_image = ?";
        await query(sqlImage, [idImage]);

        const folderPath = path.join(__dirname, "../../image/products/Tovar" + id); 
        if (fs.existsSync(folderPath)) {
            fs.rmdirSync(folderPath, { recursive: true });
        }

        res.status(200).json({ message: "Product, related image, and folder deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

module.exports = router;
