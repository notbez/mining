const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ DB Error:', err));

// 📌 Подключаем API-роуты
app.use('/claim', require('./routes/claim'));
app.use('/boost', require('./routes/boost'));
app.use('/user', require('./routes/user'));

// 📌 Раздаём HTML-страницы
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/rating', (req, res) => res.sendFile(path.join(__dirname, 'views', 'rating.html')));
app.get('/mining', (req, res) => res.sendFile(path.join(__dirname, 'views', 'mining.html')));
app.get('/tasks', (req, res) => res.sendFile(path.join(__dirname, 'views', 'tasks.html')));
app.get('/friends', (req, res) => res.sendFile(path.join(__dirname, 'views', 'friends.html')));
app.get('/daily', (req, res) => res.sendFile(path.join(__dirname, 'views', 'daily.html')));
app.get('/weekly', (req, res) => res.sendFile(path.join(__dirname, 'views', 'weekly.html')));
app.get('/buy-boost', (req, res) => res.sendFile(path.join(__dirname, 'views', 'buy-boost.html')));

// Запускаем сервер
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));