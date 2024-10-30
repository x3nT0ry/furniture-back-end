const express = require("express");
const router = express.Router();
const db = require("../../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../image/slider"),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.put("/edit-slide/:id", upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const newImage = req.file ? req.file.filename : null;

    try {
        const [slide] = await db.query(
            "SELECT image FROM Slider WHERE id_slider = ?",
            [id]
        );

        if (!slide) {
            return res.status(404).json({ message: "Слайд не знайдено" });
        }

        if (newImage && slide.image) {
            const oldImagePath = path.join(
                "E:/furniture-backend/image/slider",
                slide.image
            );
            fs.unlink(oldImagePath, (error) => {
                if (error) {
                } else {
                }
            });
        }

        const updatedData = [title, description, newImage || slide.image, id];
        await db.query(
            "UPDATE Slider SET title = ?, description = ?, image = ? WHERE id_slider = ?",
            updatedData
        );

        res.status(200).json({ message: "Слайд успішно оновлено" });
    } catch (error) {
        console.error("Помилка оновлення слайда:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

module.exports = router;
