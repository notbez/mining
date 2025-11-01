document.addEventListener("DOMContentLoaded", () => {
      const telegramId = localStorage.getItem("telegramId");
      const chethik = document.getElementById("chethik");
      const zavodBtn = document.querySelector(".zavod");
      const zavodImg = document.getElementById("zavodImg");
    
      if (!telegramId) {
        console.warn("⚠️ Telegram ID не найден в localStorage");
        return;
      }
    
      let miningActive = false;
      let balanceUpdater = null;
    
      // ===== Обновление баланса =====
      async function updateBalance() {
        try {
          const res = await fetch(`/mining/coins/${telegramId}`);
          const data = await res.json();
          chethik.textContent = data.coins ?? 0;
        } catch (err) {
          console.error("Ошибка при обновлении баланса:", err);
        }
      }
    
      // ===== Запуск майнинга =====
      async function startMining() {
        if (miningActive) return; // уже запущен
    
        try {
          const res = await fetch(`/mining/start/${telegramId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
    
          const data = await res.json();
    
          if (!res.ok) {
            console.warn("Ошибка запуска майнинга:", data.error || data.message);
            return;
          }
    
          console.log("Майнинг успешно запущен");
          miningActive = true;
          zavodImg.src = "/icons/active-mining.gif"; // 🔁 можно заменить на анимированную иконку
        } catch (err) {
          console.error("Ошибка при запуске майнинга:", err);
        }
      }
    
      // ===== Проверка статуса майнинга =====
      async function checkMiningStatus() {
        try {
          const res = await fetch(`/mining/status/${telegramId}`);
          const data = await res.json();
    
          if (data.active) {
            miningActive = true;
            zavodImg.src = "/icons/active-mining.gif";
          } else {
            miningActive = false;
            zavodImg.src = "/icons/static-mining.png";
          }
        } catch (err) {
          console.error("Ошибка при проверке статуса майнинга:", err);
        }
      }
    
      // ===== Автообновление баланса =====
      balanceUpdater = setInterval(updateBalance, 10000); // обновление каждые 10 сек
      updateBalance(); // сразу при запуске
      checkMiningStatus(); // проверяем, не был ли майнинг активен
    
      // ===== Событие клика =====
      zavodBtn.addEventListener("click", async () => {
        await startMining();
        await updateBalance();
      });
    });