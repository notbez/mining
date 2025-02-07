const express = require('express');
const router = express.Router();
const User = require('../models/User');

function getDaysDifference(lastDate) {
    if (!lastDate) return null;
    const last = new Date(lastDate);
    const now = new Date();
    return Math.floor((now - last) / (1000 * 60 * 60 * 24));
}

// 📅 Daily Claim
router.post('/daily', async (req, res) => {
    const { telegramId } = req.body;
    let user = await User.findOne({ telegramId });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const daysDiff = getDaysDifference(user.lastDailyClaim);

    if (daysDiff === 0) {
        return res.status(400).json({ error: 'Вы уже получили бонус сегодня' });
    } else if (daysDiff > 1) {
        user.dailyStreak = 0;
    }

    user.dailyStreak += 1;
    user.lastDailyClaim = new Date();
    user.stars += 10 * user.dailyStreak;

    await user.save();
    res.json({ success: true, streak: user.dailyStreak, stars: user.stars });
});

// 🏆 Weekly Claim
router.post('/weekly', async (req, res) => {
    const { telegramId } = req.body;
    let user = await User.findOne({ telegramId });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const daysDiff = getDaysDifference(user.lastWeeklyClaim);

    if (daysDiff < 7) {
        return res.status(400).json({ error: 'Можно получить бонус только раз в неделю' });
    } else if (daysDiff > 14) {
        user.weeklyStreak = 0;
    }

    user.weeklyStreak += 1;
    user.lastWeeklyClaim = new Date();
    user.stars += 100 * user.weeklyStreak;

    await user.save();
    res.json({ success: true, streak: user.weeklyStreak, stars: user.stars });
});

module.exports = router;