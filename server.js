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

const uri = 'mongodb+srv://Mishkan:pibpec-ziwfo4-kEcxer@mining.8cel2.mongodb.net/?retryWrites=true&w=majority&appName=Mining';

console.log("🔌 Подключаемся к MongoDB...");
mongoose.connect(uri)
  .then(() => console.log('✅ Успешное подключение к MongoDB'))
  .catch(err => {
    console.error('❌ Ошибка подключения к MongoDB:', err);
    process.exit(1); // Если ошибка, сразу завершаем процесс
  });

app.use((req, res, next) => {
    console.log(`➡ Запрос: ${req.method} ${req.url}`);
    next();
});

console.log("📌 Подключаем API...");
try {
  app.use('/user', require('./routes/user'));
  console.log("✅ /user загружен (временный)");
} catch (error) {
  console.error("❌ Ошибка при подключении API:", error);
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
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера', message: err.message });
});
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));