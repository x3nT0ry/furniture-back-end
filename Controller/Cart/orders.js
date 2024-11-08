const express = require('express');
const router = express.Router();
const db = require('../../db'); 
const util = require('util');

router.post('/orders', async (req, res) => {
    const {
        shippingMethod,
        city,
        department,
        firstName,
        lastName,
        phone,
        email,
        telegram,
        items
    } = req.body;


    let connection;

    try {
        connection = await db.getConnection();

        const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
        const query = util.promisify(connection.query).bind(connection);
        const commit = util.promisify(connection.commit).bind(connection);
        const rollback = util.promisify(connection.rollback).bind(connection);

        await beginTransaction();

        const sanitizedItems = items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity, 10) || 1,
            price: parseFloat(item.price) || 0
        }));

        const total = sanitizedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        console.log("Computed total:", total);

        const orderResult = await query(
            `INSERT INTO Orders (shippingMethod, city, department, firstName, lastName, phone, email, telegram, total) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [shippingMethod, city, department, firstName, lastName, phone, email, telegram, total]
        );
        const orderId = orderResult.insertId;

        console.log("Inserted order ID:", orderId);

        for (const item of sanitizedItems) {
            if (!item.productId) {
                throw new Error('productId відсутній у товарі');
            }
            await query(
                `INSERT INTO OrderItems (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)`,
                [orderId, item.productId, item.quantity, item.price]
            );
        }

        await commit();

        res.status(200).json({ message: 'Замовлення успішно створено', orderId, total });
    } catch (error) {
        if (connection) {
            try {
                await rollback();
            } catch (rollbackError) {
                console.error('Помилка при відкочуванні транзакції:', rollbackError);
            }
        }
        console.error('Помилка при створенні замовлення:', error);
        res.status(500).json({ message: 'Помилка при створенні замовлення' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
