const express = require("express");
const router = express.Router();
const db = require("../../db");
const fs = require("fs");
const path = require("path");

router.delete("/delete-slide/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [slide] = await db.query("SELECT image FROM Slider WHERE id_slider = ?", [id]);

        if (!slide || !slide.image) {
            return res.status(404).json({ message: "Слайд або зображення не знайдено" });
        }

        const imagePath = path.join("E:/furniture-backend/image/slider", slide.image);

        await db.query("DELETE FROM Slider WHERE id_slider = ?", [id]);

        fs.unlink(imagePath, (error) => {
            if (error) {
                return res.status(500).json({ message: "Помилка видалення зображення" });
            }
            res.status(200).json({ message: "Слайд та зображення успішно видалені" });
        });
        
    } catch (error) {
        console.error("Помилка при видаленні слайда:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

module.exports = router;
