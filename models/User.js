const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    username: { type: String, default: "User" },
    rating: { type: Number, default: 0 },
    wallet: { type: String, default: null }, // Адрес кошелька
    avatar: { type: String, default: "/icons/default-avatar.png" }, // Ссылка на аву
    stars: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    lastDailyClaim: { type: Date, default: null },
    weeklyStreak: { type: Number, default: 0 },
    lastWeeklyClaim: { type: Date, default: null }
});

module.exports = mongoose.model('User', UserSchema);