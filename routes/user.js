const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Получение данных о пользователе
router.get('/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    let user = await User.findOne({ telegramId });

    if (!user) {
        user = new User({ telegramId });
        await user.save();
    }

    res.json(user);
});

module.exports = router;  // ✅ Экспортируем router