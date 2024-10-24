const express = require('express');
const router = express.Router();
const { query } = require('../../db');

router.post('/requests', async (req, res) => {
    const { firstName, lastName, email, phone, country, city, question, tracking_code } = req.body;

    try {
        const sql = `
            INSERT INTO request (name, surname,email, phone, country, city, question, tracking_code, datetime) 
            VALUES (?,?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        await query(sql, [firstName, lastName, email, phone, country, city, question, tracking_code]);

        res.status(200).json({ message: 'Запит успішно створено.' });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Сталася помилка при створенні запиту.' });
    }
});

module.exports = router;
