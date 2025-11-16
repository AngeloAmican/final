
document.addEventListener('DOMContentLoaded', () => {
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFRPhnCs-F25Rs0hi_j7vV8nmxMkputFJaORMHg_AH7GyBGgltIcuGghcbejMpgHlPcXkdgvY5otwy/pub?output=csv';

  const tableBody = document.getElementById('evaluationTableBody');
  const responseModal = document.getElementById('responseModal');
  const responseContent = document.getElementById('responseContent');
  const statsModal = document.getElementById('statsModal');
  const statsDetails = document.getElementById('statsDetails');
  const statsBtn = document.getElementById('statsBtn');

  let rows = [];
  let headers = [];
  let currentIndex = 0;

  fetch(CSV_URL)
    .then(r => r.text())
    .then(text => {
      const parsed = parseCSV(text);
      headers = parsed.headers;
      rows = parsed.rows;
      populateTable(rows);
    })
    .catch(err => console.error('Error loading CSV:', err));

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    const headers = splitCSVLine(lines.shift());
    const rows = lines.map(line => {
      const values = splitCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => (obj[h] = values[i] || ''));
      return obj;
    });
    return { headers, rows };
  }

  function splitCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else current += ch;
    }
    result.push(current);
    return result;
  }

  function populateTable(data) {
    tableBody.innerHTML = '';
    data.forEach((row, i) => {
      const name =
        row['Patient Name'] || row['Name'] || row['FullName'] || row['patient'] || 'Unknown';
      const timestamp =
        row['Timestamp'] || row['Date'] || row['Time'] || row['Datetime'] || '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(timestamp)}</td>
        <td><button class="viewResponseBtn" data-index="${i}">View</button></td>
      `;
      tableBody.appendChild(tr);
    });

    document.querySelectorAll('.viewResponseBtn').forEach(btn => {
      btn.addEventListener('click', e => {
        currentIndex = parseInt(e.currentTarget.dataset.index);
        openResponseModal(currentIndex);
      });
    });
  }

  function escapeHtml(s) {
    return s == null ? '' : String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function openResponseModal(index) {
    const row = rows[index];
    responseContent.innerHTML = `
      <div class="response-title">${escapeHtml(row['Patient Name'] || 'Patient Response')}</div>
    `;

    headers.forEach(h => {
      const value = row[h] || '';
      if (!h.trim()) return;
      const item = document.createElement('div');
      item.className = 'response-item';
      item.innerHTML = `<span class="q">${escapeHtml(h)}</span><span class="a">${escapeHtml(value)}</span>`;
      responseContent.appendChild(item);
    });

    responseModal.classList.add('show');
  }

  document.getElementById('closeResponse').addEventListener('click', () => {
    responseModal.classList.remove('show');
  });
  responseModal.addEventListener('click', e => {
    if (e.target === responseModal) responseModal.classList.remove('show');
  });

  document.getElementById('nextResponse').addEventListener('click', () => {
    if (currentIndex < rows.length - 1) {
      currentIndex++;
      openResponseModal(currentIndex);
    }
  });
  document.getElementById('prevResponse').addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      openResponseModal(currentIndex);
    }
  });

  statsBtn.addEventListener('click', openStatsModal);
  document.getElementById('closeStats').addEventListener('click', () => {
    statsModal.classList.remove('show');
  });
  statsModal.addEventListener('click', e => {
    if (e.target === statsModal) statsModal.classList.remove('show');
  });

  function openStatsModal() {
    statsDetails.innerHTML = '';

    const questionHeaders = headers.filter(h => {
      const low = h.toLowerCase();
      return !(
        low.includes('name') ||
        low.includes('email') ||
        low.includes('timestamp') ||
        low.includes('time') ||
        low.includes('date')
      );
    });

    const question1to12 = questionHeaders.slice(0, 12);
    const question13to15 = questionHeaders.filter(h => /question\s*(1[3-5]|13|14|15)/i.test(h));


    const allChoices = {};
    question1to12.forEach(q => {
      rows.forEach(r => {
        const ans = (r[q] || '').trim();
        if (ans) allChoices[ans] = (allChoices[ans] || 0) + 1;
      });
    });

    const chartBlock = document.createElement('div');
    chartBlock.className = 'stats-item';
    chartBlock.innerHTML = `
      <strong>Overall Responses (Questions 1–12)</strong>
      <div style="margin-top:0;">
        <canvas id="combinedChart" height="110"></canvas>
      </div>
      <div id="chartLegend"></div>
    `;
    statsDetails.appendChild(chartBlock);

    const labels = Object.keys(allChoices);
    const data = Object.values(allChoices);
    const colors = labels.map((_, i) => `hsl(${(i * 35) % 360},70%,55%)`);

    new Chart(document.getElementById('combinedChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Responses',
          data,
          backgroundColor: colors,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
        layout: { padding: { top: 0 } } 
      }
    });

    const legendDiv = document.getElementById('chartLegend');
    legendDiv.innerHTML = labels.map((l, i) => `
      <div style="display:inline-block;margin-right:12px;">
        <span style="background:${colors[i]};width:14px;height:14px;display:inline-block;border-radius:3px;margin-right:5px;"></span>
        ${escapeHtml(l)}
      </div>
    `).join('');

    question1to12.forEach(q => {
      const counts = {};
      rows.forEach(r => {
        const ans = (r[q] || '').trim();
        if (ans) counts[ans] = (counts[ans] || 0) + 1;
      });
      const block = document.createElement('div');
      block.className = 'stats-item';
      block.innerHTML = `
        <div class="stats-question"><strong>${escapeHtml(q)}</strong></div>
        <div class="stats-counts">${
          Object.entries(counts).map(([k, v]) => `<div>${escapeHtml(k)} — <strong>${v}</strong></div>`).join('') || '<em>No responses</em>'
        }</div>
      `;
      statsDetails.appendChild(block);
    });

    question13to15.forEach(q => {
      const answers = rows.map(r => r[q] || '').filter(v => v.trim() !== '');
      const block = document.createElement('div');
      block.className = 'stats-item';
      block.innerHTML = `
        <div class="stats-question"><strong>${escapeHtml(q)}</strong></div>
        <ul style="margin-top:4px;">${
          answers.length
            ? answers.map(a => `<li>${escapeHtml(a)}</li>`).join('')
            : '<li><em>No responses</em></li>'
        }</ul>
      `;
      statsDetails.appendChild(block);
    });

    statsModal.classList.add('show');
  }
});
const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('show');
  });