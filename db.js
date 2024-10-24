
const mysql = require("mysql");

const pool = mysql.createPool({
    connectionLimit: 10, 
    host: "localhost",
    user: "wpadmin",
    password: "351221",
    database: "furniture",
});


const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) {
                return reject(error); 
            }
            resolve(results); 
        });
    });
};

module.exports = { query }; 
