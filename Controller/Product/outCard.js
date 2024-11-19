const express = require("express");
const { query } = require("../../db");

const router = express.Router();

router.get("/characteristics", async (req, res) => {
    try {
        const characteristics = await query(`
            SELECT c.id as characteristic_id, c.title as characteristic_title,
                   o.id as option_id, o.title as option_title
            FROM characteristic c
            JOIN characteristic_options o ON c.id = o.id_attr
            ORDER BY c.id, o.id
        `);

        const characteristicMap = {};
        characteristics.forEach(row => {
            const charId = row.characteristic_id;
            if (!characteristicMap[charId]) {
                characteristicMap[charId] = {
                    id: charId,
                    title: row.characteristic_title,
                    options: []
                };
            }
            characteristicMap[charId].options.push({
                id: row.option_id,
                title: row.option_title
            });
        });

        const characteristicList = Object.values(characteristicMap);

        res.json(characteristicList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Не вдалося отримати характеристики" });
    }
});
router.get("/products", async (req, res) => {
    try {
        const result = await query(
            `SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo, 
                    i.image, i.hoverImage, i.image2, i.image3, c.category
             FROM products p
             LEFT JOIN image i ON p.id_img = i.id_image
             JOIN category c ON p.id_category = c.id_category`
        );
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Не вдалося отримати продукти" });
    }
});

router.post("/products/filter", async (req, res) => {
    try {
        const filters = req.body.filters;
        const searchTerm = req.body.searchTerm;
        const category = req.body.category;

        let queryStr = `
            SELECT p.id_products, p.name, p.price, p.description, p.additionalInfo, 
                   i.image, i.hoverImage, i.image2, i.image3, c.category
            FROM products p
            LEFT JOIN image i ON p.id_img = i.id_image
            JOIN category c ON p.id_category = c.id_category
        `;

        let whereClauses = [];
        let values = [];

        if (filters && Object.keys(filters).length > 0) {
            let productIdsForFilters = null;

            for (const [charId, optionIds] of Object.entries(filters)) {
                const placeholders = optionIds.map(() => '?').join(',');

                const rows = await query(`
                    SELECT pc.product_id
                    FROM product_characteristics pc
                    JOIN characteristic_options co ON pc.option_id = co.id
                    WHERE co.id_attr = ? AND co.id IN (${placeholders})
                `, [charId, ...optionIds]);

                const productIds = rows.map(row => row.product_id);

                if (productIdsForFilters === null) {
                    productIdsForFilters = new Set(productIds);
                } else {
                    productIdsForFilters = new Set(productIds.filter(id => productIdsForFilters.has(id)));
                }
            }

            if (productIdsForFilters && productIdsForFilters.size > 0) {
                whereClauses.push(`p.id_products IN (${[...productIdsForFilters].map(() => '?').join(',')})`);
                values.push(...productIdsForFilters);
            } else {
                return res.json([]);
            }
        }

        if (searchTerm) {
            whereClauses.push('p.name LIKE ?');
            values.push(`%${searchTerm}%`);
        }

        if (category) {
            whereClauses.push('c.category = ?');
            values.push(category);
        }

        if (whereClauses.length > 0) {
            queryStr += ' WHERE ' + whereClauses.join(' AND ');
        }

        const result = await query(queryStr, values);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Не вдалося отримати продукти" });
    }
});

module.exports = router;
