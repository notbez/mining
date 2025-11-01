// routes/mining.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

const COINS_PER_MIN = 100;
const MINING_DURATION_MIN = 1; // duration of one mining session in minutes

// Start mining
router.post("/start/:telegramId", async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.miningSession?.isActive) {
      return res.status(400).json({ error: "Mining already in progress" });
    }

    const now = new Date();
    user.miningSession = {
      startedAt: now,
      minedMinutes: 0,
      isActive: true,
    };

    await user.save();
    console.log(`Mining started for ${telegramId}`);

    // Automatically finish mining after duration
    setTimeout(async () => {
      const updatedUser = await User.findOne({ telegramId });
      if (updatedUser && updatedUser.miningSession?.isActive) {
        updatedUser.hm += COINS_PER_MIN * MINING_DURATION_MIN;
        updatedUser.miningSession.isActive = false;
        updatedUser.miningSession.minedMinutes = MINING_DURATION_MIN;
        await updatedUser.save();
        console.log(`Mining completed for ${telegramId} (+${COINS_PER_MIN})`);
      }
    }, MINING_DURATION_MIN * 60 * 1000);

    res.json({
      success: true,
      startedAt: now,
      message: "Mining started successfully",
    });
  } catch (err) {
    console.error("Error starting mining:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get mining status
router.get("/status/:telegramId", async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.miningSession?.isActive) {
      return res.json({ active: false, totalCoins: user.hm || 0 });
    }

    const now = new Date();
    const { startedAt } = user.miningSession;
    const elapsedMs = now - new Date(startedAt);
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    const minutesLeft = Math.max(0, MINING_DURATION_MIN - elapsedMinutes);

    res.json({
      active: true,
      minedMinutes: elapsedMinutes,
      minutesLeft,
      totalCoins: user.hm,
    });
  } catch (err) {
    console.error("Error fetching mining status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user coins
router.get("/coins/:telegramId", async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ coins: user.hm || 0 });
  } catch (err) {
    console.error("Error fetching coins:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Stop mining manually
router.post("/stop/:telegramId", async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.miningSession?.isActive) {
      return res.status(400).json({ error: "No active mining session" });
    }

    const now = new Date();
    const elapsedMinutes = Math.floor(
      (now - new Date(user.miningSession.startedAt)) / 60000
    );
    const reward = Math.min(elapsedMinutes, MINING_DURATION_MIN) * COINS_PER_MIN;

    user.hm += reward;
    user.miningSession.isActive = false;
    user.miningSession.minedMinutes = elapsedMinutes;
    await user.save();

    console.log(`Mining stopped manually for ${telegramId} (+${reward} HM)`);

    res.json({
      success: true,
      totalCoins: user.hm,
      message: "Mining stopped manually",
    });
  } catch (err) {
    console.error("Error stopping mining:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;