// routes/user.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const User = require("../models/User");
require("dotenv").config();

// Cloudinary config (if keys missing, upload endpoints will error — that's OK for now)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 200, height: 200, crop: "limit" }],
  },
});
const upload = multer({ storage });

// Helper: create temporary user if missing
async function ensureUser(telegramId) {
  if (!telegramId) throw new Error("telegramId required");
  let user = await User.findById(telegramId);
  if (!user) {
    user = new User({
      _id: telegramId,
      username: `temp_user_${telegramId}`,
      avatar: "https://res.cloudinary.com/demo/image/upload/default-avatar.png",
      coins: 0,
      hm: 0,
      stars: 0,
    });
    await user.save();
  }
  return user;
}

// GET user by telegramId (creates if missing)
router.get("/:telegramId", async (req, res) => {
  try {
    const telegramId = req.params.telegramId;
    const user = await ensureUser(telegramId);
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err.message || err);
    res.status(500).json({ error: "Server error getting user" });
  }
});

// POST daily-login (body: { telegramId })
router.post("/daily-login", async (req, res) => {
  try {
    const { telegramId } = req.body;
    if (!telegramId) return res.status(400).json({ error: "telegramId required" });

    const user = await ensureUser(telegramId);

    const now = new Date();
    const last = user.lastLogin ? new Date(user.lastLogin) : null;
    const DAY = 24 * 60 * 60 * 1000;

    if (!last || now - last >= DAY) {
      // award daily coins (for example 10)
      user.coins = (user.coins || 0) + 10;
      user.lastLogin = now;
      user.streak = (user.streak || 0) + 1;
      await user.save();
      return res.json({ success: true, bonus: 10, newBalance: user.coins });
    } else {
      return res.status(400).json({ error: "Already claimed today" });
    }
  } catch (err) {
    console.error("Daily login error:", err.message || err);
    res.status(500).json({ error: "Server error on daily-login" });
  }
});

// update username
router.post("/update-username", async (req, res) => {
  try {
    const { telegramId, username } = req.body;
    if (!telegramId || !username) return res.status(400).json({ error: "Invalid data" });

    const user = await User.findByIdAndUpdate(
      telegramId,
      { username },
      { new: true, upsert: true }
    );
    res.json({ success: true, username: user.username });
  } catch (err) {
    console.error("Update username error:", err);
    res.status(500).json({ error: "Server error updating username" });
  }
});

// update wallet
router.post("/update-wallet", async (req, res) => {
  try {
    const { telegramId, wallet } = req.body;
    if (!telegramId || !wallet) return res.status(400).json({ error: "Invalid data" });

    const user = await User.findByIdAndUpdate(
      telegramId,
      { wallet },
      { new: true, upsert: true }
    );
    res.json({ success: true, wallet: user.wallet });
  } catch (err) {
    console.error("Update wallet error:", err);
    res.status(500).json({ error: "Server error updating wallet" });
  }
});

// upload avatar
router.post("/upload-avatar/:telegramId", upload.single("avatar"), async (req, res) => {
  try {
    const telegramId = req.params.telegramId;
    if (!req.file?.path) return res.status(400).json({ error: "File not uploaded" });

    const avatarUrl = req.file.path;
    const user = await User.findByIdAndUpdate(
      telegramId,
      { avatar: avatarUrl },
      { new: true, upsert: true }
    );
    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ error: "Server error uploading avatar" });
  }
});

// get coins/hm (returns coins and hm)
router.get("/:telegramId/coins", async (req, res) => {
  try {
    const user = await ensureUser(req.params.telegramId);
    res.json({ coins: user.coins || 0, hm: user.hm || 0 });
  } catch (err) {
    console.error("Get coins error:", err);
    res.status(500).json({ error: "Server error getting coins" });
  }
});

// update coins (body: { telegramId, coinsDelta })
router.post("/update-coins", async (req, res) => {
  try {
    const { telegramId, coinsDelta } = req.body;
    if (!telegramId || typeof coinsDelta !== "number") {
      return res.status(400).json({ error: "Invalid data" });
    }

    const user = await User.findByIdAndUpdate(
      telegramId,
      { $inc: { coins: coinsDelta } },
      { new: true, upsert: true }
    );
    res.json({ success: true, coins: user.coins });
  } catch (err) {
    console.error("Update coins error:", err);
    res.status(500).json({ error: "Server error updating coins" });
  }
});

// ===================== DAILY LOGIN =====================
router.post('/daily-login', async (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId) {
    return res.status(400).json({ error: 'Отсутствует telegramId' });
  }

  try {
    let user = await User.findById(telegramId);
    if (!user) {
      user = new User({ _id: telegramId, telegramId });
    }

    const now = new Date();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    const isNewDay =
      !lastLogin ||
      now.toDateString() !== lastLogin.toDateString();

    if (isNewDay) {
      user.streak = (user.streak || 0) + 1;
      user.lastLogin = now;
      user.balance += 10; // награда за ежедневный вход
      await user.save();
    }

    res.json({
      success: true,
      message: isNewDay
        ? `Бонус за вход начислен! Текущий стрик: ${user.streak}`
        : 'Сегодня уже получен бонус',
      user,
    });
  } catch (err) {
    console.error('❌ Ошибка daily login:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;