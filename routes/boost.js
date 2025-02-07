const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Покупка буста
router.post('/buy-boost', async (req, res) => {
    const { telegramId, boostType } = req.body;
    let user = await User.findOne({ telegramId });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const prices = { small: 50, medium: 350, large: 3500 };
    if (!prices[boostType] || user.stars < prices[boostType]) {
        return res.status(400).json({ error: 'Недостаточно старсов' });
    }

    user.stars -= prices[boostType];
    await user.save();
    res.json({ success: true, starsLeft: user.stars });
});

module.exports = router;  // ✅ Экспортируем router