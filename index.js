const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'image')));
app.use('/images/slider', express.static(path.join(__dirname, 'image/slider')));

// Підключення маршрутів для слайдерів
app.use('/api', require('./Controller/Sliders/outSlider'));
app.use('/api', require('./Controller/Sliders/addSlider'));
app.use('/api', require('./Controller/Sliders/deleteSlider'));
app.use('/api', require('./Controller/Sliders/editSlider'));

// Підключення маршрутів для авторизації
app.use('/api', require('./Controller/Auth/checkPass'));
app.use('/api', require('./Controller/Auth/registr'));

// Підключення маршрутів для запитів
app.use('/api', require('./Controller/Requestion/request'));
app.use('/api', require('./Controller/Requestion/outRequest'));
app.use('/api', require('./Controller/Requestion/outDatailRequest'));
app.use('/api', require('./Controller/Requestion/newState'));
app.use('/api', require('./Controller/Requestion/delete'));

// Підключення маршруту для отримання продуктів
app.use("/api", require("./Controller/Product/outCard"));
app.use("/api", require("./Controller/Product/inputCard"));
app.use("/api", require("./Controller/Product/addCard"));
app.use("/api", require("./Controller/Product/deleteCard"));
app.use("/api", require("./Controller/Product/editCard"));
app.use("/api", require("./Controller/Product/photo"));
app.use("/api", require("./Controller/Product/headCard"));
app.use("/api", require("./Controller/Product/moreCard"));
app.use("/api", require("./Controller/Product/productCard"));

// Підключення маршруту для отримання функцій
app.use("/api", require("./Controller/Function/sort"));
app.use("/api", require("./Controller/Function/finder"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
