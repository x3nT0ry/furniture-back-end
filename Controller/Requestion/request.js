const express = require('express');
const router = express.Router();
const { query } = require('../../db');
const fetch = require('node-fetch');

router.post('/requests', async (req, res) => {
    const { firstName, lastName, email, phone, country, city, question, tracking_code, captchaToken } = req.body;

    const secretKey = '6LfbU3YqAAAAAAGYC2uoS6qfRCKC3sDaEgvmcGkm'; 
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    const response = await fetch(verificationUrl, { method: 'POST' });
    const verificationResult = await response.json();
   

    if (!verificationResult.success) {
        return res.status(400).json({ message: 'CAPTCHA verification failed.' });
    }

    try {
        const sql = `
            INSERT INTO request (name, surname, email, phone, country, city, question, tracking_code, datetime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        await query(sql, [firstName, lastName, email, phone, country, city, question, tracking_code]);

        res.status(200).json({ message: 'Запит успішно створено.' });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Сталася помилка при створенні запиту.' });
    }
});

module.exports = router;
