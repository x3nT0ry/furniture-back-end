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
        cb(null, Date.now() + "_" + file.fieldname + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.get("/editCard/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo, 
                  i.image, i.hoverImage, i.image2, i.image3, p.id_category
            FROM products p
            LEFT JOIN image i ON p.id_img = i.id_image
            WHERE p.id_products = ?`;
        const [product] = await query(sql, [id]);

        if (product) {
            const characteristicsQuery = `
                SELECT c.id AS characteristicId, c.title AS characteristic_title, co.id AS optionId, co.title AS option_title
                FROM product_characteristics pc
                JOIN characteristic_options co ON pc.option_id = co.id
                JOIN characteristic c ON co.id_attr = c.id
                WHERE pc.product_id = ?`;
            const characteristicsResults = await query(characteristicsQuery, [id]);

            product.characteristics = characteristicsResults;

            res.status(200).json(product);
        } else {
            res.status(404).json({ error: "Товар не знайдено" });
        }
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
            id_category,
            characteristics,
        } = req.body;

        try {
            const sqlUpdateProduct = `
                UPDATE products
                SET name = ?, price = ?, description = ?, additionalInfo = ?, id_category = ?
                WHERE id_products = ?`;
            await query(sqlUpdateProduct, [
                name,
                price,
                description,
                additionalInfo,
                id_category,
                id,
            ]);

            const oldProductQuery = `
                SELECT i.image, i.hoverImage, i.image2, i.image3 
                FROM image i 
                WHERE i.id_image = (SELECT p.id_img FROM products p WHERE p.id_products = ?)`;
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
                        newImageFile.filename
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

            const imageUpdatePromises = [];

            if (
                req.files.image ||
                req.files.hoverImage ||
                req.files.image2 ||
                req.files.image3
            ) {
                const newImageFields = ["image", "hoverImage", "image2", "image3"];
                const newImageValues = [];

                newImageFields.forEach((field) => {
                    if (req.files[field]) {
                        newImageValues.push(req.files[field][0].filename);
                    } else {
                        const oldImage = oldImages[field]
                            ? path.basename(oldImages[field])
                            : null;
                        newImageValues.push(oldImage);
                    }
                });

                const relativeImagePath = `/images/products/Tovar${id}/image/${newImageValues[0]}`;
                const relativeHoverImagePath = `/images/products/Tovar${id}/hoverImage/${newImageValues[1]}`;
                const relativeImage2Path = `/images/products/Tovar${id}/image2/${newImageValues[2]}`;
                const relativeImage3Path = `/images/products/Tovar${id}/image3/${newImageValues[3]}`;

                const sqlUpdateImage = `
                    UPDATE image
                    SET image = ?, hoverImage = ?, image2 = ?, image3 = ?
                    WHERE id_image = (SELECT id_img FROM products WHERE id_products = ?)`;
                imageUpdatePromises.push(
                    query(sqlUpdateImage, [
                        relativeImagePath,
                        relativeHoverImagePath,
                        relativeImage2Path,
                        relativeImage3Path,
                        id,
                    ])
                );
            }

            await Promise.all(imageUpdatePromises);

            if (characteristics) {
                const characteristicsData = JSON.parse(characteristics);

                const currentOptionsQuery =
                    "SELECT option_id FROM product_characteristics WHERE product_id = ?";
                const currentOptions = await query(currentOptionsQuery, [id]);

                const currentOptionIds = currentOptions.map((opt) => opt.option_id);
                const newOptionIds = characteristicsData.map((char) =>
                    parseInt(char.optionId)
                );

                const optionsToDelete = currentOptionIds.filter(
                    (optId) => !newOptionIds.includes(optId)
                );

                const optionsToAdd = newOptionIds.filter(
                    (optId) => !currentOptionIds.includes(optId)
                );

                if (optionsToDelete.length > 0) {
                    const deleteQuery = `DELETE FROM product_characteristics WHERE product_id = ? AND option_id IN (?)`;
                    await query(deleteQuery, [id, optionsToDelete]);
                }

                const insertPromises = optionsToAdd.map((optionId) =>
                    query(
                        "INSERT INTO product_characteristics (product_id, option_id) VALUES (?, ?)",
                        [id, optionId]
                    )
                );

                await Promise.all(insertPromises);
            }

            res.status(200).json({ message: "Product updated successfully" });
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ error: "Failed to update product" });
        }
    }
);

module.exports = router;