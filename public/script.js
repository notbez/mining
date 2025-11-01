// public/script.js
const tg = window.Telegram.WebApp;
tg.expand();

const userId = tg.initDataUnsafe?.user?.id || "123456";

// ======================
// ===== DOM READY ======
// ======================

document.addEventListener("DOMContentLoaded", async () => {
  await checkDailyLogin();
  await updateUserInfo();
  updateActiveTab();

  if (window.location.pathname === "/rating") {
    initRatingTabs();
    await loadTopUsers("overall");
  }

  loadTopUsers("overall");
});

// ======================
// === DAILY LOGIN ======
// ======================

async function checkDailyLogin() {
  try {
    await fetch("/user/daily-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId: userId }),
    });
    console.log("Daily login recorded");
  } catch (error) {
    console.error("Error during daily login:", error);
  }
}

// ======================
// === NAVIGATION =======
// ======================

function updateActiveTab() {
  const pageMap = {
    "/": "profile",
    "/rating": "rating",
    "/mining": "mining",
    "/friends": "friends",
  };

  const currentPage = pageMap[window.location.pathname];

  document.querySelectorAll(".bottom-nav button").forEach((btn) => {
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

// ======================
// === REWARDS / BOOSTS =
// ======================

async function claimReward(type) {
  try {
    const response = await fetch(`/claim/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId: userId }),
    });

    const data = await response.json();
    if (data.success) {
      alert(`Reward received: ${data.stars} stars`);
      window.location.href = "/";
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(`Error claiming ${type}:`, error);
  }
}

async function buyBoost(boostType) {
  try {
    const response = await fetch("/boost/buy-boost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId: userId, boostType }),
    });

    const data = await response.json();
    if (data.success) {
      alert(`Boost ${boostType} activated. Remaining: ${data.starsLeft} stars`);
      window.location.href = "/";
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error buying boost:", error);
  }
}

// ======================
// === USER INFO ========
// ======================

async function updateUserInfo(retry = 0) {
  try {
    const response = await fetch(`/user/${userId}`);
    const user = await response.json();

    if ((!user || user.stars === undefined) && retry < 3) {
      console.warn("Empty response, retrying in 1s...");
      setTimeout(() => updateUserInfo(retry + 1), 1000);
      return;
    }

    if (document.getElementById("username"))
      document.getElementById("username").innerText = user.username || "User";

    if (document.getElementById("stars")) {
      const starsEl = document.getElementById("stars");
      if (user.stars !== undefined && user.stars !== null) {
        starsEl.innerText = user.stars;
      }
    }

    if (document.getElementById("chethik"))
      document.getElementById("chethik").innerText = user.hm || 0;

    if (document.getElementById("rating"))
      document.getElementById("rating").innerText = user.rating || 0;

    if (document.getElementById("avatarImg")) {
      const avatarUrl = user.avatar?.startsWith("http")
        ? user.avatar
        : "https://res.cloudinary.com/dctmt8c6a/image/upload/v1746142273/1010_trcxqw.png";
      document.getElementById("avatarImg").src = avatarUrl;
    }
  } catch (error) {
    console.error("Error updating user info:", error);
  }
}

async function updateWallet() {
  const newWallet = document.getElementById("walletInput").value;

  await fetch("/user/update-wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegramId: userId, wallet: newWallet }),
  });

  alert("Wallet connected");
  updateUserInfo();
}

function showUsernameInput() {
  document.getElementById("username").style.display = "none";
  document.getElementById("usernameEditSection").style.display = "block";
}

async function updateUsername() {
  const newUsername = document.getElementById("usernameInput").value;

  if (!newUsername.trim()) {
    alert("Username cannot be empty");
    return;
  }

  const response = await fetch("/user/update-username", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegramId: userId, username: newUsername }),
  });

  const data = await response.json();
  if (data.success) {
    document.getElementById("username").innerText = data.username;
    alert("Username updated");
  } else {
    alert("Error updating username");
  }
}

function showAvatarUpload() {
  document.getElementById("avatarUploadSection").style.display = "block";
}

async function uploadAvatar() {
  const fileInput = document.getElementById("avatarInput");
  if (!fileInput.files.length) {
    alert("Select an image first");
    return;
  }

  const formData = new FormData();
  formData.append("avatar", fileInput.files[0]);

  try {
    const response = await fetch(`/user/upload-avatar/${userId}`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    if (text.startsWith("<")) {
      alert("Server error. Check logs.");
      return;
    }

    const data = JSON.parse(text);
    if (data.success) {
      document.getElementById("avatarImg").src =
        data.avatar + "?t=" + new Date().getTime();
      alert("Avatar updated");
    } else {
      alert("Avatar upload error: " + data.error);
    }
  } catch (error) {
    alert("Error uploading image");
  }
}

// ======================
// === RATING / TOP =====
// ======================

function initRatingTabs() {
  const ratingButtons = document.querySelectorAll(".pereklraiting");
  const iconSets = [
    { active: "overallact.png", inactive: "overallinac.png" },
    { active: "cabalact.png", inactive: "cabalinac.png" },
    { active: "leugeact.png", inactive: "leugeinac.png" },
  ];
  const types = ["overall", "cabal", "league"];

  ratingButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      ratingButtons.forEach((b, i) => {
        const img = b.querySelector("img");
        img.src = `/icons/${
          i === index ? iconSets[i].active : iconSets[i].inactive
        }`;
      });

      loadTopUsers(types[index]);
    });
  });
}

async function loadTopUsers(type) {
  const list = document.getElementById("topUsersList");
  if (!list) return;

  if (type !== "overall") {
    list.innerHTML = `
      <div class="tech-works">
        <h3>Section under maintenance</h3>
        <p>The "${type}" leaderboard is temporarily unavailable.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = "<p>Loading...</p>";
  try {
    const response = await fetch("/rating/overall");
    const users = await response.json();

    if (!users || users.length === 0) {
      list.innerHTML = "<p>No rating data available.</p>";
      return;
    }

    list.innerHTML = `
      <div class="rating-table">
      ${users
        .map(
          (u, i) => `
          <div class="rating-row">
            <span class="place">#${i + 1}</span>
            <span class="user">${u.username}</span>
            <span class="score">${u.balance ?? 0}</span>
          </div>`
        )
        .join("")}
      </div>`;
  } catch (err) {
    console.error(err);
    list.innerHTML = "<p>Error loading rating data.</p>";
  }
}