const express = require("express");
const router = express.Router();
const { query } = require("../../db");
const fs = require("fs");
const path = require("path");

router.delete("/deleteCard/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sqlGetImageId = "SELECT id_img FROM products WHERE id_products = ?";
        const productRows = await query(sqlGetImageId, [id]);

        if (productRows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const idImage = productRows[0].id_img;

        const sqlDeleteCharacteristics = "DELETE FROM product_characteristics WHERE product_id = ?";
        await query(sqlDeleteCharacteristics, [id]);

        const sqlDeleteOrderItems = "DELETE FROM orderitems WHERE productId = ?";
        await query(sqlDeleteOrderItems, [id]);

        const sqlDeleteProduct = "DELETE FROM products WHERE id_products = ?";
        await query(sqlDeleteProduct, [id]);

        const sqlDeleteImage = "DELETE FROM image WHERE id_image = ?";
        await query(sqlDeleteImage, [idImage]);

        const folderPath = path.join(__dirname, "../../image/products/Tovar" + id); 
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }

        res.status(200).json({ message: "Product, related characteristics, order items, image, and folder deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

module.exports = router;