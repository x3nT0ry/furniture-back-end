const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Your database connection

// Endpoint to register a new user
router.post('/register', async (req, res) => {
    const { login, password } = req.body;

    // Check if the login already exists
    const checkQuery = 'SELECT * FROM admin_account WHERE login = ?';
    db.query(checkQuery, [login], async (error, results) => {
        if (error) {
            console.error('Error checking user:', error);
            return res.status(500).json({ success: false, message: 'Error checking user' });
        }

        if (results.length > 0) {
            // User already exists
            return res.json({ success: false, message: 'Користувач вже зареєстрований' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO admin_account (login, password) VALUES (?, ?)';
        db.query(query, [login, hashedPassword], (error, results) => {
            if (error) {
                console.error('Error saving user:', error);
                return res.status(500).json({ success: false, message: 'Error saving user' });
            }
            res.json({ success: true });
        });
    });
});

module.exports = router;