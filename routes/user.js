// routes/user.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../models/User');
require('dotenv').config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 200, height: 200, crop: 'limit' }],
  },
});

const upload = multer({ storage });

// GET user by telegramId
router.get('/:telegramId', async (req, res) => {
  try {
    let user = await User.findById(req.params.telegramId);

    if (!user) {
      user = new User({
        _id: req.params.telegramId,
        avatar: 'https://res.cloudinary.com/demo/image/upload/default-avatar.png',
      });
      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error('❌ Ошибка получения пользователя:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST update username
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
    console.error('❌ Ошибка обновления ника:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST update wallet
router.post('/update-wallet', async (req, res) => {
  const { telegramId, wallet } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { _id: telegramId },
      { wallet },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    res.json({ success: true, wallet: user.wallet });
  } catch (err) {
    console.error('❌ Ошибка обновления кошелька:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST upload avatar
router.post('/upload-avatar/:telegramId', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const avatarUrl = req.file.path;

    let user = await User.findById(req.params.telegramId);
    if (!user) {
      user = new User({ _id: req.params.telegramId });
    }
    user.avatar = avatarUrl;
    await user.save();

    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    console.error('❌ Ошибка загрузки аватарки:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;