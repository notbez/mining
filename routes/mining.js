// routes/mining.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

const COINS_PER_MIN = 10;
const MINING_DURATION_MIN = 60;

router.post('/start/:telegramId', async (req, res) => {
  try {
    const user = await User.findById(req.params.telegramId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();

    // Проверка: уже идёт майнинг?
    if (user.miningSession?.isActive) {
      return res.status(400).json({ error: 'Mining already in progress' });
    }

    // Запуск новой сессии
    user.miningSession = {
      startedAt: now,
      minedMinutes: 0,
      isActive: true
    };

    await user.save();
    res.json({ success: true, startedAt: now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/status/:telegramId', async (req, res) => {
  try {
    const user = await User.findById(req.params.telegramId);
    if (!user || !user.miningSession?.isActive) {
      return res.json({ active: false });
    }

    const now = new Date();
    const { startedAt, minedMinutes } = user.miningSession;

    const totalElapsed = Math.floor((now - new Date(startedAt)) / 60000);
    const newMinutes = totalElapsed - minedMinutes;

    // Уже прошло больше часа?
    if (totalElapsed >= MINING_DURATION_MIN) {
      const remainingReward = (MINING_DURATION_MIN - minedMinutes) * COINS_PER_MIN;
      if (remainingReward > 0) user.hm += remainingReward;

      user.miningSession.isActive = false;
      await user.save();

      return res.json({ active: false, totalHM: user.hm });
    }

    // Начисляем награду за новые минуты
    if (newMinutes > 0) {
      const reward = newMinutes * COINS_PER_MIN;
      user.hm += reward;
      user.miningSession.minedMinutes = minedMinutes + newMinutes;
      await user.save();
    }

    return res.json({
      active: true,
      totalHM: user.hm,
      minedMinutes: user.miningSession.minedMinutes,
      minutesLeft: MINING_DURATION_MIN - totalElapsed
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;