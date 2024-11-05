const express = require('express');
const router = express.Router();
const db = require('../../db');

router.delete('/delete-requests', async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('Invalid input: ids should be a non-empty array');
    }

    try {
        const placeholders = ids.map(() => '?').join(',');
        const sql = `DELETE FROM request WHERE id_request IN (${placeholders})`;
        
        const result = await db.query(sql, ids);

        if (result.affectedRows === 0) {
            return res.status(404).send('No requests found for the provided IDs');
        }

        res.status(200).send(`${result.affectedRows} request(s) deleted successfully`);
    } catch (error) {
        console.error("Error deleting requests:", error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
