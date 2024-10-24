const express = require('express');
const router = express.Router();
const db = require('../../db'); 

router.delete('/delete-request/:id', async (req, res) => {
    const requestId = req.params.id;

    try {
        const result = await db.query('DELETE FROM request WHERE id_request = ?', [requestId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Request not found');
        }

        res.status(200).send('Request deleted successfully');
    } catch (error) {
        console.error("Error deleting request:", error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
