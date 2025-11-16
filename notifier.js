document.addEventListener("DOMContentLoaded", () => {
  const bell = document.createElement("div");
  bell.innerHTML = '<i class="fa-solid fa-bell"></i>';
  bell.style.position = "fixed";
  bell.style.top = "20px";
  bell.style.right = "25px";
  bell.style.fontSize = "28px";
  bell.style.color = "#555";
  bell.style.cursor = "pointer";
  bell.style.zIndex = "9999";
  bell.style.transition = "transform 0.3s ease";
  document.body.appendChild(bell);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-15deg); }
      75% { transform: rotate(15deg); }
    }
    .notif-box {
      position: fixed;
      top: 60px;
      right: 15px;
      width: 300px;
      max-height: 300px;
      overflow-y: auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 99999;
      display: none;
      padding: 10px;
      font-family: Arial, sans-serif;
    }
    .notif-item {
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 8px;
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: fadeIn 0.3s ease;
    }
    .notif-item p {
      margin: 0;
      font-size: 14px;
      color: #333;
      line-height: 1.3;
    }
    .notif-item button {
      background: none;
      border: none;
      color: #888;
      font-size: 16px;
      cursor: pointer;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  const toastContainer = document.createElement("div");
  toastContainer.style.position = "fixed";
  toastContainer.style.top = "65px";
  toastContainer.style.right = "20px";
  toastContainer.style.zIndex = "9999";
  document.body.appendChild(toastContainer);

  const notifBox = document.createElement("div");
  notifBox.className = "notif-box";
  document.body.appendChild(notifBox);

  let schedules = JSON.parse(localStorage.getItem("schedules")) || [];

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.background =
      type === "success" ? "#28a745" :
      type === "warning" ? "#ffc107" :
      type === "info" ? "#007bff" :
      "#dc3545";
    toast.style.color = "white";
    toast.style.padding = "10px 15px";
    toast.style.marginTop = "10px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    toast.style.opacity = "1";
    toast.style.transition = "opacity 0.5s ease";
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  function checkUpcomingSchedules() {
    schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const now = new Date();
    let hasUpcoming = false;

    schedules.forEach((s) => {
      if (s.archived) return;
      const schedTime = new Date(`${s.date}T${s.time}`);
      const diffMinutes = (schedTime - now) / 60000;

      if (diffMinutes > 0 && diffMinutes <= 15 && !s.notified) {
        const timeFormatted = schedTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        addNotificationItem(s.name, timeFormatted);
        showToast(`⏰ Reminder: ${s.name} has a schedule at ${timeFormatted}`, "warning");

        s.notified = true;
        hasUpcoming = true;
      }
    });

    localStorage.setItem("schedules", JSON.stringify(schedules));

    if (hasUpcoming) {
      bell.style.color = "#ff9800";
      bell.style.animation = "shake 0.6s ease-in-out infinite alternate";
    } else {
      bell.style.color = "#555";
      bell.style.animation = "none";
    }
  }

  function addNotificationItem(name, time) {
    const item = document.createElement("div");
    item.className = "notif-item";
    item.innerHTML = `
      <p><b>${name}</b><br><small>${time}</small></p>
      <button title="Dismiss">❌</button>
    `;
    item.querySelector("button").addEventListener("click", () => item.remove());
    notifBox.prepend(item); 
  }

  checkUpcomingSchedules();
  setInterval(checkUpcomingSchedules, 60000);

  bell.addEventListener("click", () => {
    notifBox.style.display = notifBox.style.display === "none" ? "block" : "none";
    bell.style.color = "#555";
    bell.style.animation = "none";
  });
});
  