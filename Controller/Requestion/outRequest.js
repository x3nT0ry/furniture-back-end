const express = require('express');
const router = express.Router();
const { query } = require('../../db'); 

router.get('/all-requests', async (req, res) => {
    try {
        const sql = `
            SELECT id_request, name, email, country, tracking_code, question, datetime 
            FROM request
             ORDER BY datetime DESC; 

        `;
        const results = await query(sql);

        
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'An error occurred while fetching requests.' });
    }

    
});

module.exports = router; 
