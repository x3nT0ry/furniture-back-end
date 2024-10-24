const express = require('express');
const router = express.Router();
const { query } = require('../../db'); 

router.put('/update-request/:id', async (req, res) => {
    const { id } = req.params;
    const { stateRequest } = req.body; 

    try {
        const sql = `
            UPDATE request SET stateRequest = ? WHERE id_request = ?
        `;
        await query(sql, [stateRequest, id]);

        res.status(200).json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

module.exports = router; 
