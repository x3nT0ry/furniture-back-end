const express = require('express');
const router = express.Router();
const { query } = require('../../db'); 

const getAdminLogin = async (req, res) => {
    console.log("Received request for admin login");
    try {
        const adminId = req.session.adminId; 
        const result = await query('SELECT login FROM admin_account WHERE id = ?', [adminId]);

        if (result.length > 0) {
            res.json({ login: result[0].login });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        console.error('Error retrieving admin login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


router.get('/takeLogin', getAdminLogin);

module.exports = router;
