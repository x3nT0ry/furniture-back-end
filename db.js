// /db/index.js
const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "wpadmin",
    password: "351221",
    database: "furniture",
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.stack);
        return;
    }
    console.log("Connected to the database.");
});

module.exports = db; // Export the connection for use in other files
