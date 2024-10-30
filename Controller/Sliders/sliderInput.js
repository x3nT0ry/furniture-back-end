const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/slides", async (req, res) => {
    try {
        const slides = await db.query("SELECT id_slider, title, description, image FROM Slider");
        res.json(slides);
    } catch (error) {
        console.error("Ошибка получения слайдов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
