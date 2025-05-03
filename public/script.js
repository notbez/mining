// script.js

const tg = window.Telegram.WebApp;
tg.expand();

const userId = tg.initDataUnsafe?.user?.id || "123456";

document.addEventListener('DOMContentLoaded', async () => {
    await checkDailyLogin();
    await updateUserInfo();
    updateActiveTab();

    if (window.location.pathname === '/rating') {
        await loadTopUsers();
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
        console.log("📤 Отправляем файл на сервер...");

        const response = await fetch(`/user/upload-avatar/${userId}`, {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        console.log("📥 Ответ от сервера (сырой):", text);

        if (text.startsWith('<')) {
            console.error("❌ Сервер вернул HTML вместо JSON! Ошибка на сервере!");
            alert("❌ Ошибка сервера. Проверьте логи.");
            return;
        }

        const data = JSON.parse(text);
        console.log("📸 Сервер вернул JSON:", data);

        if (data.success) {
            document.getElementById('avatarImg').src = data.avatar + "?t=" + new Date().getTime();
            console.log("URL от сервера:", data.avatar);
            alert("✅ Аватарка обновлена!");
        } else {
            console.error("❌ Ошибка сервера:", data);
            alert("❌ Ошибка загрузки аватарки: " + data.error);
        }
    } catch (error) {
        console.error("❌ Ошибка обработки ответа сервера:", error);
        alert("❌ Ошибка при загрузке изображения.");
    }
}

// 🚀 Загрузка топ-юзеров
async function loadTopUsers() {
    try {
        const response = await fetch('/rating/top-users');
        const data = await response.json();

        const container = document.getElementById('topUsersList');
        if (!container) {
            console.error("❌ Не найден элемент #topUsersList");
            return;
        }

        container.innerHTML = ''; // Очищаем старый список

        data.forEach(user => {
            const item = document.createElement('div');
            item.className = 'top-user-item';
            item.innerHTML = `
                <span>${user.rank}. ${user.username}</span> — <span>${user.rating} pts</span>
            `;
            container.appendChild(item);
        });

        console.log("✅ Топ-юзеры загружены!");
    } catch (error) {
        console.error("❌ Ошибка загрузки топ-юзеров:", error);
    }
}