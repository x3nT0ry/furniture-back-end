const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/sliders", async (req, res) => {
    try {
        const slides = await db.query("SELECT * FROM Slider ORDER BY order_index"); 
        res.json(slides);
    } catch (error) {
        console.error("Помилка завантаження слайдів:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});


router.put("/sliders/order", async (req, res) => {
    const { orderedSlides } = req.body; 
    try {
        await Promise.all(orderedSlides.map((id, index) => 
            db.query("UPDATE Slider SET order_index = ? WHERE id_slider = ?", [index, id])
        ));
        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating slide order:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
