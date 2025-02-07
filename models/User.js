const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    rating: { type: Number, default: 0 },
    walletConnected: { type: Boolean, default: false },
    stars: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    lastDailyClaim: { type: Date, default: null },
    weeklyStreak: { type: Number, default: 0 },
    lastWeeklyClaim: { type: Date, default: null }
});

module.exports = mongoose.model('User', UserSchema);
