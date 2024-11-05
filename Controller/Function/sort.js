const express = require('express');
const router = express.Router();
const db = require('../../db'); 

router.get('/sorts', (req, res) => {
    const sort = req.query.sort;
    let query = `
        SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo, p.tables,
               i.image, i.hoverImage, i.image2, i.image3, c.category
        FROM products p
        LEFT JOIN image i ON p.id_img = i.id_image
        JOIN category c ON p.id_category = c.id_category
    `;

    if (sort === 'asc') {
        query += ' ORDER BY p.price ASC';
    } else if (sort === 'desc') {
        query += ' ORDER BY p.price DESC';
    } else if (sort === 'id') {
        query += ' ORDER BY p.id_products ASC';
    }

    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.json(results);
    });
});

module.exports = router;
