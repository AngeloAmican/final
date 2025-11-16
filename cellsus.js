document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('nameInput');
  const courseInput = document.getElementById('courseInput');
  const idInput = document.getElementById('idInput');
  const complaintInput = document.getElementById('complaintInput');
  const medicineInput = document.getElementById('medicineInput');
  const addBtn = document.getElementById('addPatientBtn');
  const tableBody = document.getElementById('patientTableBody');

  function loadPatients() {
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    tableBody.innerHTML = '';

    patients.forEach(patient => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${patient.date}</td>
        <td>${patient.name}</td>
        <td>${patient.course}</td>
        <td>${patient.id}</td>
        <td>${patient.complaint}</td>
        <td>${patient.medicine}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const course = courseInput.value.trim();
      const id = idInput.value.trim();
      const complaint = complaintInput.value.trim();
      const medicine = medicineInput.value.trim();

      if (!name || !course || !id || !complaint || !medicine) {
        alert("Please fill out all fields.");
        return;
      }

      const now = new Date();
      const newPatient = {
        date: now.toLocaleString(),     
        createdAt: now.toISOString(),     
        name,
        course,
        id,
        complaint,
        medicine
      };

      const patients = JSON.parse(localStorage.getItem('patients')) || [];
      patients.unshift(newPatient); 
      localStorage.setItem('patients', JSON.stringify(patients));

      let complaints = JSON.parse(localStorage.getItem('complaintsData')) || [];
      complaints.push(complaint);
      localStorage.setItem('complaintsData', JSON.stringify(complaints));

      nameInput.value = '';
      courseInput.value = '';
      idInput.value = '';
      complaintInput.value = '';
      medicineInput.value = '';

      loadPatients();
    });
  }

  if (tableBody) loadPatients();
});
const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('show');
  });
  
(function() {
  const addBtn = document.getElementById('addPatientBtn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    const medName = document.getElementById('medicineInput').value.trim();
    if (!medName) return; 

    setTimeout(() => {
      try {
        const raw = localStorage.getItem('med-inventory-v1');
        if (!raw) return;
        const meds = JSON.parse(raw);

        const med = meds.find(m => m.name.toLowerCase() === medName.toLowerCase());
        if (!med) {
          console.warn(`Medicine "${medName}" not found in inventory.`);
          return;
        }

        if (med.quantity > 0) {
          med.quantity -= 1; 
          localStorage.setItem('med-inventory-v1', JSON.stringify(meds));
          console.log(`✅ ${medName} stock deducted by 1. Remaining: ${med.quantity}`);
        } else {
          alert(`⚠️ ${med.name} is out of stock!`);
        }
      } catch (e) {
        console.error('Inventory update failed:', e);
      }
    }, 100); 
  });
})();
(function() {
  const addBtn = document.getElementById('addPatientBtn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    const medField = document.getElementById('medicineInput');
    if (!medField) return;

    const medValue = medField.value.trim();
    if (!medValue) return; 

    const medsParsed = medValue.split(',').map(item => {
      const match = item.trim().match(/^(.+?)\s*\((\d+)\)$/);
      if (match) {
        return { name: match[1].trim(), qty: parseInt(match[2]) };
      } else {
        return { name: item.trim(), qty: 1 };
      }
    });

    setTimeout(() => {
      try {
        const raw = localStorage.getItem('med-inventory-v1');
        if (!raw) return;
        const meds = JSON.parse(raw);

        medsParsed.forEach(({ name, qty }) => {
          const med = meds.find(m => m.name.toLowerCase() === name.toLowerCase());
          if (!med) {
            console.warn(`Medicine "${name}" not found in inventory.`);
            return;
          }

          if (med.quantity >= qty) {
            med.quantity -= qty;
            console.log(`✅ ${name} stock deducted by ${qty}. Remaining: ${med.quantity}`);
          } else {
            alert(`⚠️ Not enough stock for ${name}! Available: ${med.quantity}`);
            med.quantity = 0;
          }
        });

        localStorage.setItem('med-inventory-v1', JSON.stringify(meds));
      } catch (e) {
        console.error('Enhanced inventory update failed:', e);
      }
    }, 200);
  });
})();


document.addEventListener("DOMContentLoaded", () => { 
  const addBtn = document.getElementById("addPatientBtn");
  const tableBody = document.getElementById("patientTableBody");
  if (!addBtn || !tableBody) return;

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "🔍 Search";
  searchInput.id = "patientSearch";
  searchInput.style.marginLeft = "10px";
  searchInput.style.padding = "8px 10px";
  searchInput.style.border = "1px solid #ccc";
  searchInput.style.borderRadius = "6px";
  searchInput.style.maxWidth = "240px";

  addBtn.parentElement?.insertBefore(searchInput, addBtn.nextSibling);

  function renderFilteredPatients(searchTerm = "") {
    const patients = JSON.parse(localStorage.getItem("patients")) || [];
    const filtered = patients.filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.id && p.id.toString().toLowerCase().includes(term))
      );
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;color:#888;">No matching records found.</td>
        </tr>`;
      return;
    }

    filtered.forEach((patient) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${patient.date}</td>
        <td>${patient.name}</td>
        <td>${patient.course}</td>
        <td>${patient.id}</td>
        <td>${patient.complaint}</td>
        <td>${patient.medicine}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  searchInput.addEventListener("input", (e) => {
    renderFilteredPatients(e.target.value);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const medicineInput = document.getElementById('medicineInput');
  const modal = document.getElementById('medicineModal');
  const closeModal = document.getElementById('closeModal');
  const saveBtn = document.getElementById('saveMedicine');
  const med1Name = document.getElementById('med1Name');
  const med1Qty = document.getElementById('med1Qty');
  const med2Name = document.getElementById('med2Name');
  const med2Qty = document.getElementById('med2Qty');

  if (medicineInput) {
    medicineInput.style.display = "none";

    const btn = document.createElement('button');
    btn.textContent = 'Add Medicine';
    btn.type = 'button';
    btn.className = 'add-btn';
    btn.style.marginLeft = '5px';
    btn.style.padding = '8px 10px';
    btn.style.cursor = 'pointer';

    medicineInput.insertAdjacentElement('afterend', btn);

    btn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    saveBtn.addEventListener('click', () => {
      const m1 = med1Name.value.trim();
      const q1 = med1Qty.value.trim();
      const m2 = med2Name.value.trim();
      const q2 = med2Qty.value.trim();

      if (!m1) {
        alert('Please enter at least one medicine.');
        return;
      }


      let result = `${m1} (${q1 || 1})`;
      if (m2) result += `, ${m2} (${q2 || 1})`;

      medicineInput.value = result;


      med1Name.value = '';
      med1Qty.value = '';
      med2Name.value = '';
      med2Qty.value = '';

      modal.style.display = 'none';
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const med1Name = document.getElementById('med1Name');
  const med2Name = document.getElementById('med2Name');

  const med1Info = document.createElement('small');
  const med2Info = document.createElement('small');

  med1Info.style.color = '#666';
  med1Info.style.fontSize = '13px';
  med2Info.style.color = '#666';
  med2Info.style.fontSize = '13px';

  med1Name.insertAdjacentElement('afterend', med1Info);
  med2Name.insertAdjacentElement('afterend', med2Info);

  function checkStock(medInput, infoElement) {
    const val = medInput.value.trim();
    if (!val) {
      infoElement.textContent = '';
      return;
    }

    try {
      const raw = localStorage.getItem('med-inventory-v1');
      if (!raw) {
        infoElement.textContent = '⚠️ Inventory data not found.';
        return;
      }

      const meds = JSON.parse(raw);
      const found = meds.find(m => m.name.toLowerCase() === val.toLowerCase());

      if (found) {
        infoElement.textContent = `💊 Available: ${found.quantity} pcs`;
        infoElement.style.color = found.quantity > 0 ? 'green' : 'red';
      } else {
        infoElement.textContent = '❌ Not found in inventory';
        infoElement.style.color = 'red';
      }
    } catch (e) {
      console.error('Error checking stock:', e);
    }
  }

  med1Name.addEventListener('input', () => checkStock(med1Name, med1Info));
  med2Name.addEventListener('input', () => checkStock(med2Name, med2Info));
});