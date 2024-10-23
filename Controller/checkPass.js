const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const db = require('../db'); // Your database connection

// Endpoint to check login credentials
router.post('/checkpass', async (req, res) => {
    const { login, password } = req.body;
    
    // Query to get the user by login
    const query = 'SELECT * FROM admin_account WHERE login = ?';
    db.query(query, [login], async (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        if (results.length > 0) {
            // Compare the entered password with the hashed password
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                return res.json({ success: true });
            } else {
                return res.json({ success: false, message: 'Invalid password' });
            }
        } else {
            return res.json({ success: false, message: 'User not found' });
        }
    });
});

module.exports = router;