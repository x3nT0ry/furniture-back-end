const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../db'); 

router.post('/checkpass', async (req, res) => {
    const { login, password } = req.body;

    const queryStr = 'SELECT * FROM admin_account WHERE login = ?';
    
    try {
        const results = await db.query(queryStr, [login]);
        
        if (results.length > 0) {
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                return res.json({ success: true });
            } else {
                return res.json({ success: false, message: 'Неверный пароль' });
            }
        } else {
            return res.json({ success: false, message: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка сервера:', error);
        return res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;
