document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("schedName");
  const idInput = document.getElementById("schedId");
  const dateInput = document.getElementById("schedDate");
  const timeInput = document.getElementById("schedTime");
  const notesInput = document.getElementById("schedNotes");
  const addBtn = document.getElementById("addScheduleBtn");
  const tableBody = document.getElementById("scheduleTableBody");

  const toastContainer = document.createElement("div");
  toastContainer.style.position = "fixed";
  toastContainer.style.top = "20px";
  toastContainer.style.right = "20px";
  toastContainer.style.zIndex = "9999";
  document.body.appendChild(toastContainer);

  let schedules = JSON.parse(localStorage.getItem("schedules")) || [];

  function saveAndRender() {
    localStorage.setItem("schedules", JSON.stringify(schedules));
    renderSchedules();
  }

  function renderSchedules() {
    const now = new Date();


    schedules.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    tableBody.innerHTML = "";

    schedules.forEach((s, index) => {
      if (s.archived) return;

      const schedTime = new Date(`${s.date}T${s.time}`);
      const timeFormatted = schedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const diffMinutes = (schedTime - now) / 60000;

      let rowStyle = "";
      if (diffMinutes > 0 && diffMinutes <= 60) {
        rowStyle = "background-color: #fff3cd;";
      }

      const row = `
        <tr style="${rowStyle}">
          <td>${s.name}</td>
          <td>${s.id}</td>
          <td>${s.date}</td>
          <td>${timeFormatted}</td>
          <td>${s.notes}</td>
          <td>
            <button class="archiveBtn" data-index="${index}"
              style="background-color:#6b0000;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">
              Archive
            </button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  }

  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const id = idInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const notes = notesInput.value.trim();

    if (!name || !date || !time) {
      showToast("⚠️ Please fill in all required fields!", "warning");
      return;
    }

    schedules.push({ name, id, date, time, notes, archived: false });
    saveAndRender();

    nameInput.value = "";
    idInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
    notesInput.value = "";

    showToast("✅ Schedule added successfully!", "success");
  });

  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("archiveBtn")) {
      const index = e.target.getAttribute("data-index");
      schedules[index].archived = true;
      saveAndRender();
      showToast("📦 Schedule archived!", "info");
    }
  });

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
    }, 3000);
  }


  function checkUpcomingSchedules() {
    const now = new Date();
    schedules.forEach((s) => {
      if (s.archived) return;
      const schedTime = new Date(`${s.date}T${s.time}`);
      const diff = schedTime - now;
      const minutes = diff / 6000;

      if (minutes > 0 && minutes <= 60) {
        showToast(`⏰ Reminder: ${s.name} has a schedule at ${schedTime.toLocaleTimeString([], {
          hour: "2-digit", minute: "2-digit", hour12: true
        })}`, "warning");
      }
    });
    renderSchedules(); 
  }

  setInterval(checkUpcomingSchedules, 60000);

  renderSchedules();
});
const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('show');
  });

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("scheduleTableBody");

  function attachEditButtons() {
    document.querySelectorAll(".archiveBtn").forEach((btn) => {
      if (btn.previousSibling && btn.previousSibling.classList?.contains("editBtn")) return;

      const index = btn.dataset.index;
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "editBtn";
      editBtn.dataset.index = index;
      editBtn.style = `
        background-color:#007bff;
        color:white;
        border:none;
        padding:5px 10px;
        margin-right:6px;
        border-radius:5px;
        cursor:pointer;
      `;
      btn.parentNode.insertBefore(editBtn, btn);
    });
  }

  setTimeout(attachEditButtons, 500);
  const observer = new MutationObserver(() => attachEditButtons());
  observer.observe(tableBody, { childList: true, subtree: true });

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("editBtn")) {
      const index = e.target.dataset.index;
      const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
      const sched = schedules[index];
      if (!sched) return;

      const modal = document.getElementById("editModal");
      document.getElementById("editName").value = sched.name;
      document.getElementById("editId").value = sched.id;
      document.getElementById("editDate").value = sched.date;
      document.getElementById("editTime").value = sched.time;
      document.getElementById("editNotes").value = sched.notes;
      modal.dataset.index = index;
      modal.style.display = "flex";
    }
  });

  document.getElementById("closeEditModal").addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
  });

  document.getElementById("saveEditBtn").addEventListener("click", () => {
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const modal = document.getElementById("editModal");
    const index = modal.dataset.index;
    const updated = {
      name: document.getElementById("editName").value.trim(),
      id: document.getElementById("editId").value.trim(),
      date: document.getElementById("editDate").value,
      time: document.getElementById("editTime").value,
      notes: document.getElementById("editNotes").value.trim(),
      archived: false
    };

    const duplicate = schedules.some((s, i) =>
      i != index && !s.archived && s.date === updated.date && s.time === updated.time
    );

   if (duplicate) {
  showToast("⚠️ That date & time already has a scheduled patient!", "error");
  return;
}

    schedules[index] = updated;
    localStorage.setItem("schedules", JSON.stringify(schedules));
    modal.style.display = "none";
    showToast("✅ Schedule updated successfully!", "success");
    setTimeout(() => location.reload(), 1200);
  });

  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background-color: ${
        type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#333"
      };
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      font-size: 14px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.4s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => (toast.style.opacity = "1"), 100);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 2500);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("schedDate");
  const timeInput = document.getElementById("schedTime");
  const addBtn = document.getElementById("addScheduleBtn");

  const addAvailabilityMsg = document.createElement("div");
  addAvailabilityMsg.style.marginTop = "6px";
  addAvailabilityMsg.style.fontSize = "14px";
  addAvailabilityMsg.style.fontWeight = "500";
  dateInput.parentNode.appendChild(addAvailabilityMsg);

  function checkAddAvailability() {
    const date = dateInput.value;
    const time = timeInput.value;
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];

    if (!date || !time) {
      addAvailabilityMsg.textContent = "";
      addBtn.disabled = false;
      return;
    }

    const exists = schedules.some(
      (s) => !s.archived && s.date === date && s.time === time
    );

    if (exists) {
      addAvailabilityMsg.textContent = "⚠️ This schedule is already taken.";
      addAvailabilityMsg.style.color = "red";
      addBtn.disabled = true;
    } else {
      addAvailabilityMsg.textContent = "✅ This schedule is available.";
      addAvailabilityMsg.style.color = "green";
      addBtn.disabled = false;
    }
  }

  dateInput.addEventListener("change", checkAddAvailability);
  timeInput.addEventListener("change", checkAddAvailability);

  const observer = new MutationObserver(() => {
    const modal = document.querySelector(".modal");
    if (modal && modal.style.display === "block") {
      const modalDate = modal.querySelector("#editDate");
      const modalTime = modal.querySelector("#editTime");
      const modalSaveBtn = modal.querySelector(".save-edit-btn");

      if (!modalDate || !modalTime || !modalSaveBtn) return;

      let msg = modal.querySelector(".availability-msg");
      if (!msg) {
        msg = document.createElement("div");
        msg.className = "availability-msg";
        msg.style.marginTop = "6px";
        msg.style.fontSize = "14px";
        msg.style.fontWeight = "500";
        modalTime.parentNode.appendChild(msg);
      }

      function checkEditAvailability() {
        const date = modalDate.value;
        const time = modalTime.value;
        const schedules = JSON.parse(localStorage.getItem("schedules")) || [];

        if (!date || !time) {
          msg.textContent = "";
          modalSaveBtn.disabled = false;
          return;
        }

        const index = modalSaveBtn.getAttribute("data-index");
        const exists = schedules.some(
          (s, i) => i != index && !s.archived && s.date === date && s.time === time
        );

        if (exists) {
          msg.textContent = "⚠️ This schedule is already taken.";
          msg.style.color = "red";
          modalSaveBtn.disabled = true;
        } else {
          msg.textContent = "✅ This schedule is available.";
          msg.style.color = "green";
          modalSaveBtn.disabled = false;
        }
      }

      modalDate.addEventListener("change", checkEditAvailability);
      modalTime.addEventListener("change", checkEditAvailability);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
