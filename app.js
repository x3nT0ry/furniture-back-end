const mysql = require('mysql');

const conn = mysql.createConnection({
    host: "127.0.0.1",   
    user: "wpadmin",    
    database: "furniture",  
    password: "351221"   
});


conn.connect(err => {
    if (err) {
        console.log('Error connecting to database:', err);
        return;
    }
    console.log('Connected to the database');
});

module.exports = conn;


