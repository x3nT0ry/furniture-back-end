const express = require('express');
const router = express.Router();
const { query } = require('../../db');

router.get('/request/:id_request', async (req, res) => {
    const { id_request } = req.params;
    try {
        const sql = `
            SELECT id_request, name, surname, email, phone, country, city, question, tracking_code, datetime
            FROM request
            WHERE id_request = ?
        `;
        const results = await query(sql, [id_request]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Запит не знайдено' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching request detail:', error);
        res.status(500).json({ message: 'An error occurred while fetching request details.' });
    }
});

module.exports = router;
