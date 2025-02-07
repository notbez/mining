const tg = window.Telegram.WebApp;
tg.expand(); // Открываем на весь экран

const userId = tg.initDataUnsafe?.user?.id || "123456"; // Получаем ID пользователя

document.addEventListener('DOMContentLoaded', async () => {
    await updateUserInfo();
});

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

// 🔄 Обновляем баланс пользователя
async function updateUserInfo() {
    try {
        const response = await fetch(`/user/${userId}`);
        const user = await response.json();

        document.getElementById('username').innerText = user.username || "User";
        document.getElementById('stars').innerText = user.stars || 0;
        document.getElementById('rating').innerText = user.rating || 0;
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
    }
}

// 🔗 Подключение кошелька (заглушка)
function connectWallet() {
    alert("🔗 Кошелек подключен!");
}