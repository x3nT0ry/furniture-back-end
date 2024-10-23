// db.js
const mysql = require("mysql");

const pool = mysql.createPool({
    connectionLimit: 10, // Максимальное количество соединений
    host: "localhost",
    user: "wpadmin",
    password: "351221",
    database: "furniture",
});

// Функция для выполнения запросов
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) {
                return reject(error); // Если есть ошибка, отклоняем промис
            }
            resolve(results); // Если все хорошо, резолвим промис с результатами
        });
    });
};

module.exports = { query }; // Экспортируем функцию для использования в других файлах
