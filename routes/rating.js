const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🔹 Общий рейтинг (работает реально)
router.get('/overall', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, coins: 1, _id: 0 })
      .sort({ coins: -1 })
      .limit(50);

    const rating = users.map((u, i) => ({
      username: u.username,
      coins: u.coins || 0,
      position: i + 1,
    }));

    res.json(rating);
  } catch (err) {
    console.error('Ошибка при получении общего рейтинга:', err);
    res.status(500).json({ message: 'Ошибка при получении общего рейтинга' });
  }
});

// 🔸 Кабала — временно отключена
router.get('/cabal', (req, res) => {
  res.status(503).json({ message: '🚧 Технические работы — раздел Кабала временно недоступен.' });
});

// 🔸 Лига — временно отключена
router.get('/league', (req, res) => {
  res.status(503).json({ message: '🚧 Технические работы — раздел Лига временно недоступен.' });
});

module.exports = router;