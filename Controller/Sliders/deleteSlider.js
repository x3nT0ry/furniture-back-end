const express = require("express");
const router = express.Router();
const db = require("../../db");
const path = require("path");
const fs = require("fs");

router.delete("/delete-slides", async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No slide IDs provided" });
    }

    try {
        for (const id of ids) {
            const [slide] = await db.query("SELECT image FROM Slider WHERE id_slider = ?", [id]);
            if (slide) {
                const imagePath = path.join(__dirname, "../../image/slider", slide.image);
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Error deleting image:", err);
                });
                await db.query("DELETE FROM Slider WHERE id_slider = ?", [id]);
            }
        }
        res.status(200).json({ message: "Slides successfully deleted" });
    } catch (error) {
        console.error("Error deleting slides:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
