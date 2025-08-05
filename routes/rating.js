const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        const rating = users
            .sort((a, b) => b.coins - a.coins)
            .map((u, i) => ({
                username: u.username,
                coins: u.coins,
                position: i + 1,
            }));
        res.json({ rating });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении рейтинга' });
    }
});

router.get('/kabala', async (req, res) => {
    try {
        const users = await User.find({});
        const rating = users
            .sort((a, b) => b.kabalaCoins - a.kabalaCoins)
            .map((u, i) => ({
                username: u.username,
                kabalaCoins: u.kabalaCoins,
                position: i + 1,
            }));
        res.json({ rating });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении рейтинга кабалы' });
    }
});

router.get('/league', async (req, res) => {
    try {
        const users = await User.find({});
        const rating = users
            .sort((a, b) => b.leagueCoins - a.leagueCoins)
            .map((u, i) => ({
                username: u.username,
                leagueCoins: u.leagueCoins,
                position: i + 1,
            }));
        res.json({ rating });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении рейтинга лиги' });
    }
});

module.exports = router;