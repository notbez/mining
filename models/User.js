// 📂 models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    _id: String,
    username: { type: String, default: "User" },
    avatar: { type: String, default: "https://res.cloudinary.com/demo/image/upload/default-avatar.png" },
    stars: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },
    streak: { type: Number, default: 0 },
    weeklyProgress: { type: Number, default: 0 },
    wallet: { type: String, default: "" }
    // ⚠️ rating пока не сохраняем в базе — считаем на лету
});

module.exports = mongoose.model("User", userSchema);