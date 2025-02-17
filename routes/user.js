// routes/user.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// ⚡️ Конфиг для загрузки файлов
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
        cb(null, `${req.params.telegramId}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// 📌 Получение данных о пользователе
router.get('/:telegramId', async (req, res) => {
    try {
        let user = await User.findOne({ telegramId: req.params.telegramId });

        if (!user) {
            user = new User({ telegramId: req.params.telegramId });
            await user.save();
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 📌 Обновление ника
router.post('/update-username', async (req, res) => {
    try {
        const { telegramId, username } = req.body;
        const user = await User.findOneAndUpdate(
            { telegramId },
            { username },
            { new: true }
        );

        res.json({ success: true, username: user.username });
    } catch (error) {
        console.error('Ошибка обновления ника:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 📌 Обновление кошелька
router.post('/update-wallet', async (req, res) => {
    try {
        const { telegramId, wallet } = req.body;
        const user = await User.findOneAndUpdate(
            { telegramId },
            { wallet },
            { new: true }
        );

        res.json({ success: true, wallet: user.wallet });
    } catch (error) {
        console.error('Ошибка обновления кошелька:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 📌 Загрузка аватарки
router.post('/upload-avatar/:telegramId', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const avatarPath = `/uploads/${req.file.filename}`;
        const user = await User.findOneAndUpdate(
            { telegramId: req.params.telegramId },
            { avatar: avatarPath },
            { new: true }
        );

        res.json({ success: true, avatar: avatarPath });
    } catch (error) {
        console.error('Ошибка загрузки аватарки:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
