const express = require("express");
const { query } = require("../../db"); 
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'E:\\furniture-backend\\image\\products\\temp\\');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.fieldname + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post(
    "/addProduct",
    upload.fields([
        { name: "image" },
        { name: "hoverImage" },
        { name: "image2" },
        { name: "image3" },
    ]),
    async (req, res) => {
        try {
            const {
                name,
                price,
                description,
                additionalInfo,
                id_category,
                characteristics,
            } = req.body;

            const image = req.files["image"];
            const hoverImage = req.files["hoverImage"];
            const image2 = req.files["image2"];
            const image3 = req.files["image3"];

            if (!image || !hoverImage || !image2 || !image3) {
                return res.status(400).json({ error: "Всі зображення повинні бути завантажені" });
            }

            const productQuery =
                "INSERT INTO products (name, price, description, additionalInfo, id_category) VALUES (?, ?, ?, ?, ?)";
            const productResult = await query(productQuery, [
                name,
                price,
                description,
                additionalInfo,
                id_category,
            ]);

            const id_products = productResult.insertId;

            const productDir = path.join("E:\\furniture-backend\\image\\products", `Tovar${id_products}`);
            await fs.ensureDir(productDir);
            await fs.ensureDir(path.join(productDir, "image"));
            await fs.ensureDir(path.join(productDir, "hoverImage"));
            await fs.ensureDir(path.join(productDir, "image2"));
            await fs.ensureDir(path.join(productDir, "image3"));

            const imagePath = path.join(productDir, "image", image[0].filename);
            const hoverImagePath = path.join(productDir, "hoverImage", hoverImage[0].filename);
            const image2Path = path.join(productDir, "image2", image2[0].filename);
            const image3Path = path.join(productDir, "image3", image3[0].filename);

            try {
                await Promise.all([
                    fs.move(image[0].path, imagePath),
                    fs.move(hoverImage[0].path, hoverImagePath),
                    fs.move(image2[0].path, image2Path),
                    fs.move(image3[0].path, image3Path),
                ]);
            } catch (err) {
                console.error("Помилка при переміщенні файлів:", err);
                return res.status(500).json({ error: "Не вдалося перемістити зображення" });
            }

            const relativeImagePath = `/images/products/Tovar${id_products}/image/${image[0].filename}`;
            const relativeHoverImagePath = `/images/products/Tovar${id_products}/hoverImage/${hoverImage[0].filename}`;
            const relativeImage2Path = `/images/products/Tovar${id_products}/image2/${image2[0].filename}`;
            const relativeImage3Path = `/images/products/Tovar${id_products}/image3/${image3[0].filename}`;

            const imageQuery = "INSERT INTO image (image, hoverImage, image2, image3) VALUES (?, ?, ?, ?)";
            const imageResult = await query(imageQuery, [
                relativeImagePath,
                relativeHoverImagePath,
                relativeImage2Path,
                relativeImage3Path,
            ]);

            const id_img = imageResult.insertId;

            const updateProductQuery = "UPDATE products SET id_img = ? WHERE id_products = ?";
            await query(updateProductQuery, [id_img, id_products]);

            const characteristicsData = JSON.parse(characteristics);
            for (const char of characteristicsData) {
                const insertCharQuery =
                    "INSERT INTO product_characteristics (product_id, option_id) VALUES (?, ?)";
                await query(insertCharQuery, [id_products, char.optionId]);
            }

            res.status(201).json({ message: "Товар доданий успішно!" });
        } catch (error) {
            console.error("Помилка при додаванні товару:", error);
            res.status(500).json({ error: "Не вдалося додати товар" });
        }
    }
);

router.get("/characteristics", async (req, res) => {
    try {
        const characteristics = await query("SELECT * FROM characteristic");
        res.json(characteristics);
    } catch (error) {
        console.error("Помилка при отриманні характеристик:", error);
        res.status(500).json({ error: "Не вдалося отримати характеристики" });
    }
});

router.get("/characteristicOptions", async (req, res) => {
    try {
        const options = await query("SELECT * FROM characteristic_options");
        res.json(options);
    } catch (error) {
        console.error("Помилка при отриманні опцій характеристик:", error);
        res.status(500).json({ error: "Не вдалося отримати опції характеристик" });
    }
});

module.exports = router;
