const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../db');

router.post('/register', async (req, res) => {
    const { login, password } = req.body;

    const checkQuery = 'SELECT * FROM admin_account WHERE login = ?';
    
    try {
        const results = await db.query(checkQuery, [login]);

        if (results.length > 0) {
            return res.json({ success: false, message: 'Користувач вже зареєстрований' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO admin_account (login, password) VALUES (?, ?)';
        
        await db.query(insertQuery, [login, hashedPassword]);
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка сохранения пользователя:', error);
        return res.status(500).json({ success: false, message: 'Ошибка сохранения пользователя' });
    }
});

module.exports = router;
