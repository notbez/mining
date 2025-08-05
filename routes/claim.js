// 📂 routes/claim.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 📌 Получение награды
router.post('/:type', async (req, res) => {
    const { telegramId } = req.body;
    const type = req.params.type; // daily или weekly
    const now = new Date();

    try {
        const user = await User.findById(telegramId);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

        // Проверка буста
        let multiplier = 1;
        if (user.boosts.expiresAt && user.boosts.expiresAt > now) {
            multiplier = user.boosts.daily || 1;
        }

        if (type === 'daily') {
            const lastLogin = user.lastLogin || new Date(0);
            const diff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

            if (diff < 1) {
                return res.status(400).json({ error: 'Уже получено сегодня' });
            }

            const reward = 5 * multiplier;
            user.hm += reward;
            user.lastLogin = now;
            user.streak = (diff === 1) ? user.streak + 1 : 1;
            await user.save();

            return res.json({ success: true, hm: reward });
        }

        if (type === 'weekly') {
            if (user.weeklyProgress >= 7) {
                const reward = 20 * multiplier;
                user.hm += reward;
                user.weeklyProgress = 0;
                await user.save();

                return res.json({ success: true, hm: reward });
            } else {
                return res.status(400).json({ error: 'Нужно 7 дней подряд для получения награды' });
            }
        }

        res.status(400).json({ error: 'Неверный тип запроса' });
    } catch (error) {
        console.error('Ошибка получения награды:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;