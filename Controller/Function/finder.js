const express = require('express');
const router = express.Router();
const db = require('../../db'); 

router.get('/furniture/search', (req, res) => { 
    const query = req.query.query;

    const sqlQuery = `
        SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo, 
               i.image, i.hoverImage
        FROM products p
        LEFT JOIN image i ON p.id_img = i.id_image
        WHERE p.name LIKE ?`; 

    db.query(sqlQuery, [`%${query}%`], (error, results) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.json(results);
    });
});

module.exports = router;
