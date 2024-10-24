const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', require('./Controller/Auth/checkPass')); 
app.use('/api', require('./Controller/Auth/registr')); 
app.use('/api', require('./Controller/Requestion/request'));
app.use('/api', require('./Controller/Requestion/outRequest')); 
app.use('/api', require('./Controller/Requestion/outDatailRequest')); 
app.use('/api', require('./Controller/Requestion/newState')); 
app.use('/api', require('./Controller/Requestion/delete')); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
