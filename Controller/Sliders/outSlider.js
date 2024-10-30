const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/slides", async (req, res) => {
    try {
        const slides = await db.query("SELECT * FROM Slider");
        res.json(slides);
    } catch (error) {
        console.error("Помилка завантаження слайдів:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

router.get("/slides/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [slide] = await db.query("SELECT * FROM Slider WHERE id_slider = ?", [id]);
        if (!slide) {
            return res.status(404).json({ message: "Слайд не знайдено" });
        }
        res.json(slide);
    } catch (error) {
        console.error("Помилка завантаження слайда:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

module.exports = router;
