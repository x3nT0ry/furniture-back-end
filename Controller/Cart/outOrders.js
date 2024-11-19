const express = require('express');
const router = express.Router();
const db = require('../../db'); 
const util = require('util');

router.get('/outOrders', async (req, res) => {
    try {
        const query = util.promisify(db.query).bind(db);
        const orders = await query('SELECT * FROM Orders ORDER BY created_at DESC');
        const orderIds = orders.map(order => order.id);

        if (orderIds.length === 0) {
            return res.status(200).json([]);
        }

        const placeholders = orderIds.map(() => '?').join(',');

        const orderItems = await query(`
            SELECT 
                OrderItems.id,
                OrderItems.orderId,
                OrderItems.productId,
                OrderItems.quantity,
                (Products.price * OrderItems.quantity) AS total,
                Products.name AS productName,
                Products.price AS productPrice,
                Image.image AS productImage
            FROM 
                OrderItems
            JOIN 
                Products ON OrderItems.productId = Products.id_products
            LEFT JOIN 
                Image ON Products.id_img = Image.id_image
            WHERE 
                OrderItems.orderId IN (${placeholders})
            ORDER BY 
                OrderItems.orderId ASC
        `, orderIds);

        const ordersWithItems = orders.map(order => {
            const items = orderItems
                .filter(item => item.orderId === order.id)
                .map(item => ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    total: item.total, 
                    name: item.productName,
                    price: item.productPrice,
                    image: item.productImage
                }));
            return { ...order, items };
        });

        res.status(200).json(ordersWithItems);
    } catch (error) {
        console.error('Помилка при отриманні замовлень:', error);
        res.status(500).json({ message: 'Помилка при отриманні замовлень' });
    }
});

router.get('/outOrders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = util.promisify(db.query).bind(db);
        const order = await query('SELECT * FROM Orders WHERE id = ?', [id]);
        if (order.length === 0) {
            return res.status(404).json({ message: 'Замовлення не знайдено' });
        }

        const orderItems = await query(`
            SELECT 
                OrderItems.id,
                OrderItems.productId,
                OrderItems.quantity,
                (Products.price * OrderItems.quantity) AS total, -- Обчислення total
                Products.name AS productName,
                Products.price AS productPrice,
                Image.image AS productImage
            FROM 
                OrderItems
            JOIN 
                Products ON OrderItems.productId = Products.id_products
            LEFT JOIN 
                Image ON Products.id_img = Image.id_image
            WHERE 
                OrderItems.orderId = ?
            ORDER BY 
                OrderItems.id ASC
        `, [id]);

        const items = orderItems.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            total: item.total, 
            name: item.productName,
            price: item.productPrice,
            image: item.productImage
        }));

        res.status(200).json({ ...order[0], items });
    } catch (error) {
        console.error('Помилка при отриманні детальної інформації про замовлення:', error);
        res.status(500).json({ message: 'Помилка при отриманні детальної інформації про замовлення' });
    }
});

module.exports = router;
