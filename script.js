"use strict";

// Только проверенный HTTPS-адрес Telegram может стать ссылкой.
const telegramLink = document.getElementById("telegram-link");
const telegramUrl = window.SHUTTLE_CONFIG?.telegramUrl;
if (telegramLink && typeof telegramUrl === "string" && telegramUrl.trim()) {
  try {
    const url = new URL(telegramUrl);
    if (url.protocol === "https:" && url.hostname === "t.me" && !url.username && !url.password && /^\/[A-Za-z0-9_]{5,32}\/?$/.test(url.pathname) && !url.search && !url.hash) {
      telegramLink.href = url.href;
      telegramLink.target = "_blank";
      telegramLink.rel = "noopener noreferrer";
      telegramLink.setAttribute("aria-label", "Telegram — откроется в новой вкладке");
      telegramLink.hidden = false;
    }
  } catch {
    // Неверный адрес остаётся скрытым: не публикуем неработающий контакт.
  }
}
