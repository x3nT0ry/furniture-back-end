const express = require('express');
const router = express.Router();
const { query } = require('../../db'); 

router.get('/characteristics', async (req, res) => {
  try {
    const results = await query(`
      SELECT c.id AS characteristic_id, c.title AS characteristic_title,
             co.id AS option_id, co.title AS option_title
      FROM characteristic c
      LEFT JOIN characteristic_options co ON c.id = co.id_attr
      ORDER BY c.id
    `);

    const characteristics = [];
    const characteristicMap = {};

    results.forEach((row) => {
      const { characteristic_id, characteristic_title, option_id, option_title } = row;
      if (!characteristicMap[characteristic_id]) {
        characteristicMap[characteristic_id] = {
          id: characteristic_id,
          title: characteristic_title,
          options: []
        };
        characteristics.push(characteristicMap[characteristic_id]);
      }
      if (option_id) {
        characteristicMap[characteristic_id].options.push({
          id: option_id,
          title: option_title
        });
      }
    });

    res.json(characteristics);
  } catch (error) {
    console.error('Помилка при отриманні характеристик:', error);
    res.status(500).json({ error: 'Не вдалося отримати характеристики' });
  }
});

router.post('/characteristics', async (req, res) => {
  const { title, options } = req.body;
  if (!title || !options || !Array.isArray(options)) {
    return res.status(400).json({ error: 'Некоректні дані' });
  }

  try {
    const insertCharacteristicResult = await query(
      'INSERT INTO characteristic (title) VALUES (?)',
      [title]
    );
    const characteristicId = insertCharacteristicResult.insertId;

    for (const option of options) {
      await query(
        'INSERT INTO characteristic_options (id_attr, title) VALUES (?, ?)',
        [characteristicId, option.title]
      );
    }

    res.json({ message: 'Характеристика успішно додана' });
  } catch (error) {
    console.error('Помилка при додаванні характеристики:', error);
    res.status(500).json({ error: 'Не вдалося додати характеристику' });
  }
});

router.put('/characteristics/:id', async (req, res) => {
  const characteristicId = req.params.id;
  const { title, options } = req.body;

  if (!title || !options || !Array.isArray(options)) {
    return res.status(400).json({ error: 'Некоректні дані' });
  }

  try {
    await query('START TRANSACTION');

    await query('UPDATE characteristic SET title = ? WHERE id = ?', [title, characteristicId]);

    const existingOptions = await query('SELECT id, title FROM characteristic_options WHERE id_attr = ?', [characteristicId]);
    const existingOptionsMap = {};
    existingOptions.forEach(option => {
      existingOptionsMap[option.id] = option;
    });

    const sentOptionIds = new Set(options.filter(option => option.id != null).map(option => option.id));

    const optionsToDelete = existingOptions.filter(option => !sentOptionIds.has(option.id));

    const optionsToInsert = options.filter(option => option.id == null);

    const optionsToUpdate = options.filter(option => {
      if (option.id != null) {
        const existingOption = existingOptionsMap[option.id];
        return existingOption && existingOption.title !== option.title;
      }
      return false;
    });

    if (optionsToDelete.length > 0) {
      const optionIdsToDelete = optionsToDelete.map(option => option.id);

      await query('DELETE FROM product_characteristics WHERE option_id IN (?)', [optionIdsToDelete]);

      await query('DELETE FROM characteristic_options WHERE id IN (?)', [optionIdsToDelete]);
    }

    for (const option of optionsToInsert) {
      await query(
        'INSERT INTO characteristic_options (id_attr, title) VALUES (?, ?)',
        [characteristicId, option.title]
      );
    }

    for (const option of optionsToUpdate) {
      await query(
        'UPDATE characteristic_options SET title = ? WHERE id = ?',
        [option.title, option.id]
      );
    }

    await query('COMMIT');

    res.json({ message: 'Характеристика успішно оновлена' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Помилка при оновленні характеристики:', error);
    res.status(500).json({ error: 'Не вдалося оновити характеристику' });
  }
});
router.post('/available-options', async (req, res) => {
  const { selectedOptions } = req.body;

  try {
      const selectedOptionIds = [];
      for (const options of Object.values(selectedOptions)) {
          selectedOptionIds.push(...options);
      }

      const numberOfSelectedOptions = selectedOptionIds.length;

      let productsQuery = `
          SELECT pc.product_id
          FROM product_characteristics pc
      `;

      const queryParams = [];

      if (numberOfSelectedOptions > 0) {
          productsQuery += `
              WHERE pc.option_id IN (?)
              GROUP BY pc.product_id
              HAVING COUNT(DISTINCT pc.option_id) = ?
          `;
          queryParams.push(selectedOptionIds, numberOfSelectedOptions);
      } else {
          productsQuery += `GROUP BY pc.product_id`;
      }

      const products = await query(productsQuery, queryParams);

      const productIds = products.map((p) => p.product_id);

      if (productIds.length === 0) {
          return res.json([]);
      }

      const options = await query(
          `
          SELECT co.id AS option_id, co.title AS option_title,
                 co.id_attr AS characteristic_id, c.title AS characteristic_title,
                 COUNT(DISTINCT pc.product_id) AS product_count
          FROM product_characteristics pc
          JOIN characteristic_options co ON pc.option_id = co.id
          JOIN characteristic c ON co.id_attr = c.id
          WHERE pc.product_id IN (?)
          GROUP BY co.id
          ORDER BY c.id
          `,
          [productIds]
      );

      const characteristics = [];
      const characteristicMap = {};

      options.forEach((row) => {
          const {
              characteristic_id,
              characteristic_title,
              option_id,
              option_title,
              product_count
          } = row;
          if (!characteristicMap[characteristic_id]) {
              characteristicMap[characteristic_id] = {
                  id: characteristic_id,
                  title: characteristic_title,
                  options: [],
              };
              characteristics.push(characteristicMap[characteristic_id]);
          }
          characteristicMap[characteristic_id].options.push({
              id: option_id,
              title: option_title,
              productCount: product_count
          });
      });

      res.json(characteristics);
  } catch (error) {
      console.error('Error getting available options:', error);
      res.status(500).json({ error: 'Failed to get available options' });
  }
});
router.delete('/characteristics', async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Некоректні дані' });
  }

  try {
    const optionRows = await query('SELECT id FROM characteristic_options WHERE id_attr IN (?)', [ids]);
    const optionIds = optionRows.map(row => row.id);

    if (optionIds.length > 0) {
      await query('DELETE FROM product_characteristics WHERE option_id IN (?)', [optionIds]);

      await query('DELETE FROM characteristic_options WHERE id IN (?)', [optionIds]);
    }

    await query('DELETE FROM characteristic WHERE id IN (?)', [ids]);

    res.json({ message: 'Характеристики успішно видалені' });
  } catch (error) {
    console.error('Помилка при видаленні характеристик:', error);
    res.status(500).json({ error: 'Не вдалося видалити характеристики' });
  }
});

module.exports = router;