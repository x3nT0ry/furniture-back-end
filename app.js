const mysql = require('mysql');

// Создаем подключение к базе данных
const conn = mysql.createConnection({
    host: "127.0.0.1",   // правильный параметр для хоста
    user: "wpadmin",     // пользователь базы данных
    database: "furniture",  // имя базы данных
    password: "351221"   // пароль пользователя
});

// Подключаемся к базе данных
conn.connect(err => {
    if (err) {
        console.log('Error connecting to database:', err);
        return;
    }
    console.log('Connected to the database');
});

module.exports = conn;


