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

router.post("/addProduct", upload.fields([{ name: "image" }, { name: "hoverImage" }, { name: "image2" }, { name: "image3" }]), async (req, res) => {
    try {
        const { name, price, description, additionalInfo, id_category, tables } = req.body;


        const image = req.files["image"];
        const hoverImage = req.files["hoverImage"];
        const image2 = req.files["image2"];
        const image3 = req.files["image3"];

        if (!image || !hoverImage || !image2 || !image3) {
            return res.status(400).json({ error: "Всі зображення повинні бути завантажені" });
        }

        const productQuery = "INSERT INTO products (name, price, description, additionalInfo, id_category, tables) VALUES (?, ?, ?, ?, ?, ?)";
        const productResult = await query(productQuery, [name, price, description, JSON.stringify(additionalInfo), id_category, JSON.stringify(tables)]);

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
                fs.move(image[0].path, imagePath).catch(err => console.error("Error moving image:", err)),
                fs.move(hoverImage[0].path, hoverImagePath).catch(err => console.error("Error moving hoverImage:", err)),
                fs.move(image2[0].path, image2Path).catch(err => console.error("Error moving image2:", err)),
                fs.move(image3[0].path, image3Path).catch(err => console.error("Error moving image3:", err))
            ]);
        } catch (err) {
            console.error("Error moving files:", err);
            return res.status(500).json({ error: "Не вдалося перемістити зображення" });
        }

        const relativeImagePath = `/images/products/Tovar${id_products}/image/${image[0].filename}`;
        const relativeHoverImagePath = `/images/products/Tovar${id_products}/hoverImage/${hoverImage[0].filename}`;
        const relativeImage2Path = `/images/products/Tovar${id_products}/image2/${image2[0].filename}`;
        const relativeImage3Path = `/images/products/Tovar${id_products}/image3/${image3[0].filename}`;

        const imageQuery = "INSERT INTO image (image, hoverImage, image2, image3) VALUES (?, ?, ?, ?)";
        const imageResult = await query(imageQuery, [relativeImagePath, relativeHoverImagePath, relativeImage2Path, relativeImage3Path]);

        const id_img = imageResult.insertId; 

        const updateProductQuery = "UPDATE products SET id_img = ? WHERE id_products = ?";
        await query(updateProductQuery, [id_img, id_products]);

        res.status(201).json({ message: "Товар добавлений успішно!" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Не вдалося додати товар" });
    }
});

module.exports = router;
