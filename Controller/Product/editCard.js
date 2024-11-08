const express = require("express");
const { query } = require("../../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "E:\\furniture-backend\\image\\products\\temp\\");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + "_" + file.fieldname + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage: storage });

router.get("/editCard/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo, 
                   p.tables, i.image, i.hoverImage, i.image2, i.image3, p.id_category
            FROM products p
            LEFT JOIN image i ON p.id_img = i.id_image
            WHERE p.id_products = ?`;
        const [product] = await query(sql, [id]);
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

router.put(
    "/editCard/:id",
    upload.fields([
        { name: "image" },
        { name: "hoverImage" },
        { name: "image2" },
        { name: "image3" },
    ]),
    async (req, res) => {
        const { id } = req.params;
        const {
            name,
            price,
            description,
            additionalInfo,
            tables,
            id_category,
        } = req.body;

        try {
            const sqlUpdateProduct = `
            UPDATE products
            SET name = ?, price = ?, description = ?, additionalInfo = ?, tables = ?, id_category = ?
            WHERE id_products = ?`;
            await query(sqlUpdateProduct, [
                name,
                price,
                description,
                additionalInfo,
                tables,
                id_category,
                id,
            ]);

            const oldProductQuery = `SELECT i.image, i.hoverImage, i.image2, i.image3 FROM image i WHERE i.id_image = (SELECT p.id_img FROM products p WHERE p.id_products = ?)`;
            const [oldImages] = await query(oldProductQuery, [id]);

            const productDir = path.join(
                "E:\\furniture-backend\\image\\products",
                `Tovar${id}`
            );

            const deleteAndReplaceImage = async (
                oldImagePath,
                newImageFile,
                folderName
            ) => {
                if (oldImagePath) {
                    const fullPath = path.join(
                        productDir,
                        folderName,
                        path.basename(oldImagePath)
                    );
                    if (newImageFile) {
                        await fs.remove(fullPath); 
                    }
                }
                if (newImageFile) {
                    const newImagePath = path.join(
                        productDir,
                        folderName,
                        path.basename(oldImagePath)
                    );
                    await fs.move(newImageFile.path, newImagePath, {
                        overwrite: true,
                    }); 
                }
            };

            await Promise.all([
                deleteAndReplaceImage(
                    oldImages.image,
                    req.files.image ? req.files.image[0] : null,
                    "image"
                ),
                deleteAndReplaceImage(
                    oldImages.hoverImage,
                    req.files.hoverImage ? req.files.hoverImage[0] : null,
                    "hoverImage"
                ),
                deleteAndReplaceImage(
                    oldImages.image2,
                    req.files.image2 ? req.files.image2[0] : null,
                    "image2"
                ),
                deleteAndReplaceImage(
                    oldImages.image3,
                    req.files.image3 ? req.files.image3[0] : null,
                    "image3"
                ),
            ]);

            res.status(200).json({ message: "Product updated successfully" });
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ error: "Failed to update product" });
        }
    }
);

module.exports = router;
