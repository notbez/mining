const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));

        let user = await User.findById(userId);
        if (!user) {
            // Первый вход — создаем пользователя
            user = await User.create({ _id: userId, lastLogin: today });
            return res.json({ message: "Первый вход, 100 токенов начислено!", stars: 100 });
        }

        const lastLogin = new Date(user.lastLogin);
        const diffDays = (today - lastLogin) / (1000 * 60 * 60 * 24);

        if (diffDays > 1) {
            // Если день пропущен, сбрасываем всё
            user.streak = 1;
            user.weeklyProgress = 1;
            user.stars += 100;
        } else if (diffDays === 1) {
            // Если день подряд, увеличиваем счетчики
            user.streak += 1;
            user.weeklyProgress += 1;
            user.stars += 100;

            if (user.weeklyProgress >= 7) {
                user.stars += 300; // Бонус за 7 дней
                user.weeklyProgress = 0;
            }
        } else {
            return res.json({ message: "Вы уже получили награду за сегодня.", stars: user.stars });
        }

        user.lastLogin = today;
        await user.save();
        res.json({ message: `+100 токенов. Стрик: ${user.streak} дней.`, stars: user.stars });

    } catch (err) {
        res.status(500).json({ error: "Ошибка сервера", details: err.message });
    }
});

module.exports = router;