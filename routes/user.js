const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../models/User');
require('dotenv').config(); // Загружаем ключи из .env

// user.js (перед cloudinary.config)
console.log("Cloudinary config:");
console.log("  CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("  API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("  API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "LOADED" : "MISSING");

// ⚡️ Настраиваем Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ⚡️ Конфиг Multer для Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'avatars', // Все аватарки загружаются в папку "avatars" в Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 200, height: 200, crop: 'limit' }] // Ограничиваем размер
    }
});

const upload = multer({ storage });

// 📌 Получение данных о пользователе
router.get('/:telegramId', async (req, res) => {
    try {
        let user = await User.findById(req.params.telegramId);

        if (!user) {
            console.log("🔹 Пользователь не найден, создаем нового...");
            user = new User({ 
                _id: req.params.telegramId, 
                avatar: "https://res.cloudinary.com/demo/image/upload/default-avatar.png" 
            });
            await user.save();
        }

        console.log("✅ URL аватарки пользователя:", user.avatar); // 🔥 Отладка
        res.json(user);
    } catch (error) {
        console.error('❌ Ошибка загрузки пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 📌 Обновление ника
router.post('/update-username', async (req, res) => {
    const { telegramId, username } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { _id: telegramId },
            { username },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

        res.json({ success: true, username: user.username });
    } catch (err) {
        console.error("Ошибка обновления ника:", err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// 📌 Загрузка аватарки
router.post('/upload-avatar/:telegramId', (req, res, next) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err) {
            console.error('❌ Multer/Cloudinary error:', err);
            return res.status(500).json({ error: 'Ошибка загрузки файла', message: err.message });
        }

        try {
            console.log("📸 Попытка загрузки аватарки...");

            if (!req.file) {
                console.error("❌ Файл не загружен!");
                return res.status(400).json({ error: 'Файл не загружен' });
            }

            const avatarUrl = req.file.secure_url;
            console.log("✅ Файл загружен в Cloudinary:", avatarUrl);

            let user = await User.findById(req.params.telegramId);

            if (!user) {
                console.warn("❌ Пользователь не найден, создаем нового...");
                user = new User({ _id: req.params.telegramId, avatar: avatarUrl });
            } else {
                console.log("🔄 Обновляем аватарку...");
                user.avatar = avatarUrl;
            }

            await user.save();

            console.log("✅ Аватарка обновлена:", user.avatar);
            return res.json({ success: true, avatar: user.avatar });

        } catch (error) {
            console.error('❌ Ошибка внутри обработчика:', error);
            return res.status(500).json({ error: 'Ошибка сервера', message: error.message });
        }
    });
});

router.get('/top', async (req, res) => {
    try {
        const users = await User.find({});
        const rankedUsers = users.map(u => ({
            telegramId: u._id,
            username: u.username,
            avatar: u.avatar,
            stars: u.stars,
            streak: u.streak,
            rating: u.stars + u.streak * 10
        })).sort((a, b) => b.rating - a.rating).slice(0, 10); // top 10

        res.json(rankedUsers);
    } catch (err) {
        console.error("❌ Ошибка получения топа:", err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

module.exports = router;