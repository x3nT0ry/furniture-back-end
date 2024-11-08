const mysql = require("mysql");
const util = require("util");

const pool = mysql.createPool({
    connectionLimit: 10, 
    host: "localhost",
    user: "wpadmin",
    password: "351221",
    database: "furniture",
});

const query = util.promisify(pool.query).bind(pool);

const getConnection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
};

module.exports = {
    query,
    getConnection,
};
