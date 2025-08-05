// public/script.js

const tg = window.Telegram.WebApp;
tg.expand();

const userId = tg.initDataUnsafe?.user?.id || "123456";

// === MINING ===
let miningStart = localStorage.getItem('miningStart');
let miningTimer;

function startMiningSession() {
    const now = Date.now();
    localStorage.setItem('miningStart', now);
    miningStart = now;
    document.querySelector('.zavod img').src = "/img/mining.gif";
    updateMiningUI();
    startMiningInterval();
}

function stopMiningSession() {
    localStorage.removeItem('miningStart');
    clearInterval(miningTimer);
    miningTimer = null;
    document.querySelector('.zavod img').src = "/img/static-mining.png";
}

function startMiningInterval() {
    miningTimer = setInterval(async () => {
        const now = Date.now();
        const elapsed = now - parseInt(miningStart);

        if (elapsed >= 60 * 60 * 1000) {
            stopMiningSession();
        } else {
            try {
                await fetch('/mining/mine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegramId: userId })
                });
                console.log("⛏ Монеты начислены!");
                updateUserInfo();
            } catch (e) {
                console.error("❌ Ошибка майнинга:", e);
            }
        }
    }, 60 * 1000);
}

function updateMiningUI() {
    if (!miningStart) return;
    const elapsed = Date.now() - parseInt(miningStart);
    if (elapsed < 60 * 60 * 1000) {
        document.querySelector('.zavod img').src = "/img/mining.gif";
        startMiningInterval();
    } else {
        stopMiningSession();
    }
}

// === DOM ===
document.addEventListener('DOMContentLoaded', async () => {
    await checkDailyLogin();
    await updateUserInfo();
    updateActiveTab();

    if (window.location.pathname === '/rating') {
        initRatingTabs();
        await loadTopUsers('overall');
    }

    if (window.location.pathname === '/mining') {
        updateMiningUI();
        document.querySelector('.zavod')?.addEventListener('click', () => {
            if (!miningStart) {
                startMiningSession();
            }
        });
    }
});

async function checkDailyLogin() {
    try {
        await fetch('/user/daily-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: userId })
        });
        console.log("✅ Daily login recorded!");
    } catch (error) {
        console.error("❌ Ошибка обновления входа:", error);
    }
}

function updateActiveTab() {
    const pageMap = {
        "/": "profile",
        "/rating": "rating",
        "/mining": "mining",
        "/friends": "friends"
    };

    const currentPage = pageMap[window.location.pathname];

    document.querySelectorAll(".bottom-nav button").forEach(btn => {
        const img = btn.querySelector("img");
        const activeIcon = btn.getAttribute("data-active");
        const inactiveIcon = btn.getAttribute("data-inactive");

        if (btn.getAttribute("data-page") === currentPage) {
            img.src = `/icons/${activeIcon}`;
        } else {
            img.src = `/icons/${inactiveIcon}`;
        }
    });
}

function navigate(page) {
    window.location.href = page;
}

async function claimReward(type) {
    try {
        const response = await fetch(`/claim/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: userId })
        });

        const data = await response.json();
        if (data.success) {
            alert(`✅ Получено: ${data.stars} ⭐`);
            window.location.href = "/";
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error(`Ошибка ${type} Claim:`, error);
    }
}

async function buyBoost(boostType) {
    try {
        const response = await fetch('/boost/buy-boost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: userId, boostType })
        });

        const data = await response.json();
        if (data.success) {
            alert(`✅ Буст ${boostType} активирован! Остаток: ${data.starsLeft} ⭐`);
            window.location.href = "/";
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Ошибка покупки буста:', error);
    }
}

async function updateUserInfo() {
    try {
        const response = await fetch(`/user/${userId}`);
        const user = await response.json();

        if (document.getElementById('username')) {
            document.getElementById('username').innerText = user.username || "User";
        }
        if (document.getElementById('usernameInput')) {
            document.getElementById('usernameInput').value = user.username || "";
        }
        if (document.getElementById('stars')) {
            document.getElementById('stars').innerText = user.stars || 0;
        }
        if (document.getElementById('rating')) {
            document.getElementById('rating').innerText = user.rating || 0;
        }
        if (document.getElementById('avatarImg')) {
            const avatarUrl = user.avatar && user.avatar.startsWith('http')
                ? user.avatar
                : "https://res.cloudinary.com/dctmt8c6a/image/upload/v1746142273/1010_trcxqw.png";
            document.getElementById('avatarImg').src = avatarUrl;
        }
        if (document.getElementById('walletInput')) {
            document.getElementById('walletInput').value = user.wallet || "";
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки данных пользователя:', error);
    }
}

async function updateWallet() {
    const newWallet = document.getElementById('walletInput').value;

    await fetch('/user/update-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId, wallet: newWallet })
    });

    alert("✅ Wallet connected!");
    updateUserInfo();
}

function showUsernameInput() {
    document.getElementById('username').style.display = 'none';
    document.getElementById('usernameEditSection').style.display = 'block';
}

async function updateUsername() {
    const newUsername = document.getElementById('usernameInput').value;

    if (!newUsername.trim()) {
        alert("❌ Никнейм не может быть пустым!");
        return;
    }

    const response = await fetch('/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId, username: newUsername })
    });

    const data = await response.json();
    if (data.success) {
        document.getElementById('username').innerText = data.username;
        alert("✅ Никнейм обновлён!");
    } else {
        alert("❌ Ошибка обновления ника!");
    }
}

function showAvatarUpload() {
    document.getElementById('avatarUploadSection').style.display = 'block';
}

async function uploadAvatar() {
    const fileInput = document.getElementById('avatarInput');
    if (!fileInput.files.length) {
        alert("❌ Выберите изображение!");
        return;
    }

    const formData = new FormData();
    formData.append('avatar', fileInput.files[0]);

    try {
        const response = await fetch(`/user/upload-avatar/${userId}`, {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        if (text.startsWith('<')) {
            alert("❌ Ошибка сервера. Проверьте логи.");
            return;
        }

        const data = JSON.parse(text);
        if (data.success) {
            document.getElementById('avatarImg').src = data.avatar + "?t=" + new Date().getTime();
            alert("✅ Аватарка обновлена!");
        } else {
            alert("❌ Ошибка загрузки аватарки: " + data.error);
        }
    } catch (error) {
        alert("❌ Ошибка при загрузке изображения.");
    }
}

// === RATING ===

function initRatingTabs() {
    const ratingButtons = document.querySelectorAll(".pereklraiting");
    const iconSets = [
        { active: "overallact.png", inactive: "overallinac.png" },
        { active: "cabalact.png", inactive: "cabalinac.png" },
        { active: "leugeact.png", inactive: "leugeinac.png" }
    ];
    const types = ["overall", "cabal", "league"];

    ratingButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            ratingButtons.forEach((b, i) => {
                const img = b.querySelector("img");
                img.src = `/icons/${i === index ? iconSets[i].active : iconSets[i].inactive}`;
            });

            loadTopUsers(types[index]);
        });
    });
}

async function loadTopUsers(type = "overall") {
    try {
        const response = await fetch(`/api/rating?type=${type}`);
        const data = await response.json();

        const container = document.getElementById('topUsersList');
        if (!container) {
            console.error("❌ Не найден элемент #topUsersList");
            return;
        }

        container.innerHTML = '';

        data.rating.slice(0, 20).forEach(user => {
            const item = document.createElement('div');
            item.className = 'top-user-item';
            item.innerHTML = `
                <span>${user.position}. ${user.username}</span> — <span>${user.coins} 💰</span>
            `;
            container.appendChild(item);
        });

        console.log("✅ Рейтинг загружен:", type);
    } catch (error) {
        console.error("❌ Ошибка загрузки рейтинга:", error);
    }
}