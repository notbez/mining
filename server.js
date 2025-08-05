console.log("🚀 Запускаем сервер...");

const express = require('express');
console.log("✅ Express загружен");

const mongoose = require('mongoose');
console.log("✅ Mongoose загружен");

const cors = require('cors');
const path = require('path');
require('dotenv').config();
console.log("✅ Переменные окружения загружены");

const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));
console.log("✅ Middleware загружены");

const uri = process.env.MONGO_URI;

console.log("🔌 Подключаемся к MongoDB...");
mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('✅ Успешное подключение к MongoDB'))
  .catch(err => {
    console.error('❌ Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });

app.use((req, res, next) => {
  console.log(`➡ Запрос: ${req.method} ${req.url}`);
  next();
});

console.log("📌 Подключаем API...");
try {
  app.use('/user', require('./routes/user'));
  app.use('/claim', require('./routes/claim'));
  app.use('/boost', require('./routes/boost'));
  app.use('/mining', require('./routes/mining'));
  console.log("✅ API подключены успешно");
} catch (error) {
  console.error("❌ Ошибка при подключении API:", error);
  process.exit(1);
}

console.log("📌 Раздаём HTML-страницы...");
try {
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
  app.get('/rating', (req, res) => res.sendFile(path.join(__dirname, 'views', 'rating.html')));
  app.get('/mining', (req, res) => res.sendFile(path.join(__dirname, 'views', 'mining.html')));
  app.get('/tasks', (req, res) => res.sendFile(path.join(__dirname, 'views', 'tasks.html')));
  app.get('/friends', (req, res) => res.sendFile(path.join(__dirname, 'views', 'friends.html')));
  app.get('/daily', (req, res) => res.sendFile(path.join(__dirname, 'views', 'daily.html')));
  app.get('/weekly', (req, res) => res.sendFile(path.join(__dirname, 'views', 'weekly.html')));
  app.get('/buy-boost', (req, res) => res.sendFile(path.join(__dirname, 'views', 'buy-boost.html')));
  console.log("✅ Все страницы загружены");
} catch (error) {
  console.error("❌ Ошибка при раздаче страниц:", error);
  process.exit(1);
}

console.log("✅ Всё нормально, запускаем Express...");
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));