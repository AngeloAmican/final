document.addEventListener("DOMContentLoaded", () => {
  const todayPatientEl = document.getElementById("todayPatient");
  const totalPatientEl = document.getElementById("totalPatient");
  const todayAppointmentEl = document.getElementById("todayAppointment");
  const totalAppointmentEl = document.getElementById("totalAppointment");
  const totalAppointmentCard = document.getElementById("totalAppointmentCard");

  const patients = JSON.parse(localStorage.getItem("patients")) || [];
  const schedules = JSON.parse(localStorage.getItem("schedules")) || [];

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayPatients = patients.filter((p) => isToday(p.date));
  const totalPatients = patients.length;
  const todayAppointments = schedules.filter((s) => isToday(s.date) && !s.archived);
  const totalAppointments = schedules.length;

  todayPatientEl.textContent = todayPatients.length;
  totalPatientEl.textContent = totalPatients;
  todayAppointmentEl.textContent = todayAppointments.length;
  totalAppointmentEl.textContent = totalAppointments;
  
  const modal = document.getElementById("archiveModal");
  const closeBtn = document.querySelector(".closeBtn");
  const archivedTableBody = document.getElementById("archivedTableBody");
  const searchBox = document.getElementById("archiveSearch");

  // Render archived schedules
  function renderArchivedSchedules(searchTerm = "") {
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const archived = schedules.filter(
      (s) =>
        s.archived &&
        s.name &&
        s.name.toLowerCase().includes(searchTerm.toLowerCase())

    );

    archivedTableBody.innerHTML = "";

    if (archived.length === 0) {
      archivedTableBody.innerHTML = `
        <tr><td colspan="5" style="text-align:center;color:#888;">No archived appointments found.</td></tr>
      `;
      return;
    }

    archived.forEach((s) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="padding:8px;border:1px solid #ccc;">${s.name}</td>
        <td style="padding:8px;border:1px solid #ccc;">${s.id}</td>
        <td style="padding:8px;border:1px solid #ccc;">${s.date}</td>
        <td style="padding:8px;border:1px solid #ccc;">${s.time}</td>
        <td style="padding:8px;border:1px solid #ccc;">${s.notes || ""}</td>
        <td style="padding:8px;border:1px solid #ccc;text-align:center;">
          <button 
            class="restoreBtn"
            data-id="${s.id || s.date + s.time + s.id + s.name}"
            style="background:#007bff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">
            Restore
          </button>
        </td>
      `;
      archivedTableBody.appendChild(row);
    });
  }

  // Open modal
  totalAppointmentCard.addEventListener("click", () => {
    renderArchivedSchedules();
    modal.style.display = "flex";
  });

  // Close modal
  closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Search filter
  searchBox.addEventListener("input", (e) => {
    renderArchivedSchedules(e.target.value);
  });

  // Restore event
  archivedTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("restoreBtn")) {
      const id = e.target.getAttribute("data-id");
      const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
      const found = schedules.find(
        (s) => (s.id || s.date + s.time + s.id + s.name) === id
      );

      if (found) {
        found.archived = false;
        localStorage.setItem("schedules", JSON.stringify(schedules));
        renderArchivedSchedules(searchBox.value);
        alert("✅ Appointment restored successfully!");
      }
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("archiveSearch");
  const archivedTableBody = document.getElementById("archivedTableBody");

  function renderArchivedSchedulesEnhanced(searchTerm = "") {
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const archived = schedules
      .filter((s) => {
        if (!s.archived) return false;
        const term = searchTerm.toLowerCase();
        const byName = s.name && s.name.toLowerCase().includes(term);
        const byId = s.id && s.id.toString().toLowerCase().includes(term);
        return byName || byId;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + " " + (a.time || ""));
        const dateB = new Date(b.date + " " + (b.time || ""));
        return dateB - dateA;
      });

    archivedTableBody.innerHTML = "";

    if (archived.length === 0) {
      archivedTableBody.innerHTML = `
        <tr><td colspan="6" style="text-align:center;color:#888;">No archived appointments found.</td></tr>
      `;
      return;
    }

    archived.forEach((s) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="padding:8px;border:1px solid #ccc;">${s.name}</td>
        <td style="padding:8px;border:1px solid #ccc;">${s.id}</td>
        <td style="padding:8px;border:1px solid #ccc;">${s.date}</td>
        <td style="padding:8px;border:1px solid #ccc;">${s.time}</td>
        <td style="padding:8px;border:1px solid #ccc;">${s.notes || ""}</td>
        <td style="padding:8px;border:1px solid #ccc;text-align:center;">
          <button 
            class="restoreBtn"
            data-id="${s.id || s.date + s.time + s.id + s.name}"
            style="background:#007bff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">
            Restore
          </button>
        </td>
      `;
      archivedTableBody.appendChild(row);
    });
  }

  // Attach search listener
  if (searchBox) {
    searchBox.addEventListener("input", (e) => {
      renderArchivedSchedulesEnhanced(e.target.value);
    });
  }

  const tableContainer = archivedTableBody.parentElement;
  if (tableContainer) {
    tableContainer.style.display = "block";
    tableContainer.style.maxHeight = "400px";
    tableContainer.style.overflowY = "auto";
  }

  renderArchivedSchedulesEnhanced("");
});

