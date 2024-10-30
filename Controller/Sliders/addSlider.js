const express = require("express");
const router = express.Router();
const db = require("../../db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../image/slider"),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post("/add-slide", upload.single("image"), async (req, res) => {
    const { title, description } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        await db.query("INSERT INTO Slider (title, description, image) VALUES (?, ?, ?)", [title, description, image]);
        res.status(200).json({ message: "Слайд успешно добавлен" });
    } catch (error) {
        console.error("Ошибка добавления слайда:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
