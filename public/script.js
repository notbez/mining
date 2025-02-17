const tg = window.Telegram.WebApp;
tg.expand(); // Открываем на весь экран

const userId = tg.initDataUnsafe?.user?.id || "123456"; // Получаем ID пользователя

document.addEventListener('DOMContentLoaded', async () => {
    await checkDailyLogin(); // Фиксируем вход в мини-апп
    await updateUserInfo(); // Загружаем данные пользователя
    updateActiveTab(); // Обновляем активную иконку
});

// 📌 Фиксация ежедневного входа
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

// 📌 Функция смены иконки при переходе
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

        // Если текущая кнопка активная — меняем иконку
        if (btn.getAttribute("data-page") === currentPage) {
            img.src = `/icons/${activeIcon}`;
        } else {
            img.src = `/icons/${inactiveIcon}`;
        }
    });
}

// 📌 Навигация между страницами
function navigate(page) {
    window.location.href = page;
}

// 📅 Запрос на сервер для получения награды
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

// 💰 Покупка бустов
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

// 🔄 Обновляем баланс пользователя и его данные
async function updateUserInfo() {
    try {
        const response = await fetch(`/user/${userId}`);
        const user = await response.json();

        document.getElementById('username').innerText = user.username || "User";
        document.getElementById('usernameInput').value = user.username || "";
        document.getElementById('stars').innerText = user.stars || 0;
        document.getElementById('rating').innerText = user.rating || 0;

        // 🛠 Фикс загрузки аватарки после обновления страницы
        if (user.avatar) {
            console.log("🔄 Загружаем аватарку:", user.avatar); // Логируем путь
            document.getElementById('avatarImg').src = user.avatar;
        } else {
            document.getElementById('avatarImg').src = "/icons/default-avatar.png";
        }

        document.getElementById('walletInput').value = user.wallet || "";
    } catch (error) {
        console.error('❌ Ошибка загрузки данных пользователя:', error);
    }
}

// 🔗 Подключение кошелька
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

// 📌 Показываем поле для редактирования ника
function showUsernameInput() {
    document.getElementById('username').style.display = 'none';
    document.getElementById('usernameEditSection').style.display = 'block';
}

// 📌 Обновляем никнейм
async function updateUsername() {
    const newUsername = document.getElementById('usernameInput').value;

    if (!newUsername.trim()) {
        alert("❌ Никнейм не может быть пустым!");
        return;
    }

    await fetch('/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId, username: newUsername })
    });

    document.getElementById('username').innerText = newUsername;
    document.getElementById('username').style.display = 'block';
    document.getElementById('usernameEditSection').style.display = 'none';
}

// 📌 Показываем поле для загрузки аватарки
function showAvatarUpload() {
    document.getElementById('avatarUploadSection').style.display = 'block';
}

// 📌 Загружаем аватарку
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

        const data = await response.json();
        if (data.success) {
            document.getElementById('avatarImg').src = data.avatar;
            console.log("✅ Загружена новая аватарка:", data.avatar);
            alert("✅ Avatar uploaded!");
        } else {
            alert("❌ Ошибка загрузки аватарки.");
        }
    } catch (error) {
        console.error("Ошибка загрузки аватарки:", error);
        alert("❌ Ошибка при загрузке изображения.");
    }
}