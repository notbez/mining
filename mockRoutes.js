// mockRoutes.js
const express = require('express');
const router = express.Router();

router.get('/api/fake-cabals', (req, res) => {
    res.json([
        { name: "Cabal Alpha", balance: 1500 },
        { name: "Cabal Beta", balance: 780 },
        { name: "Cabal Omega", balance: 2500 }
    ]);
});

router.get('/api/fake-leagues', (req, res) => {
    res.json([
        { name: "League Bronze", balance: 320 },
        { name: "League Silver", balance: 900 },
        { name: "League Gold", balance: 2100 }
    ]);
});

router.get('/api/fake-users', (req, res) => {
    res.json([
        { username: "Alice", rating: 1200 },
        { username: "Bob", rating: 800 },
        { username: "Charlie", rating: 2300 }
    ]);
});

module.exports = router;