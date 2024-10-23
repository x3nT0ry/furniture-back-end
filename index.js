const express = require('express');
const cors = require('cors'); // Import CORS
const conn = require('./db'); // Your database connection file
const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware for parsing JSON bodies
app.use('/api', require('./Controller/checkPass')); // Use the checkPass routes
app.use('/api', require('./Controller/registr')); // Use the registration routes



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
