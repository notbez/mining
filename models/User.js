const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: String,
  telegramId: { type: String, unique: true },
  username: { type: String, default: "User" },
  avatar: {
    type: String,
    default: "https://res.cloudinary.com/.../default-avatar.png"
  },

  stars: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  hm: { type: Number, default: 0 },

  lastLogin: { type: Date, default: null },
  streak: { type: Number, default: 0 },
  weeklyProgress: { type: Number, default: 0 },
  wallet: { type: String, default: "" },

  boosts: {
    daily: { type: Number, default: 1 },
    expiresAt: { type: Date, default: null }
  },

  miningSession: {
    startedAt: { type: Date },
    minedMinutes: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model("User", userSchema);