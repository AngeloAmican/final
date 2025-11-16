const ctx = document.getElementById('complaintChart').getContext('2d');
const legendBox = document.getElementById('legendBox');
const toggleContainer = document.querySelector('.toggle-buttons');

let patients = JSON.parse(localStorage.getItem('patients')) || [];

const monthlyComplaints = {};
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const now = new Date();
const currentMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
const lastMonth = `${monthNames[(now.getMonth()-1+12)%12]} ${now.getFullYear()}`;

patients.forEach(p => {
  const month = p.monthRecorded || currentMonth;
  const complaint = (p.complaint || "").trim().toLowerCase();
  if (!complaint) return;
  if (!monthlyComplaints[month]) monthlyComplaints[month] = [];
  monthlyComplaints[month].push(complaint);
});

function countComplaints(data) {
  const counts = {};
  data.forEach(c => counts[c] = (counts[c] || 0) + 1);
  return counts;
}

const currentCounts = countComplaints(monthlyComplaints[currentMonth] || []);
const lastCounts = countComplaints(monthlyComplaints[lastMonth] || []);

const allComplaints = [...new Set([...Object.keys(currentCounts), ...Object.keys(lastCounts)])];

function generatePastelColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    colors.push(`hsl(${hue}, 70%, 80%)`); 
  }
  return colors;
}

const pastelColors = generatePastelColors(allComplaints.length);

const chartData = {
  labels: allComplaints.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
  datasets: [
    {
      label: currentMonth,
      data: allComplaints.map(c => currentCounts[c] || 0),
      backgroundColor: pastelColors,
      borderRadius: 10
    },
    {
      label: lastMonth,
      data: allComplaints.map(c => lastCounts[c] || 0),
      backgroundColor: pastelColors.map(c => c.replace('80%', '70%')), // slightly darker shade for comparison
      borderRadius: 10
    }
  ]
};

const chartConfig = {
  type: 'bar',
  data: chartData,
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  }
};

const complaintChart = new Chart(ctx, chartConfig);

function updateLegend() {
  legendBox.innerHTML = '';
  allComplaints.forEach((c, i) => {
    const total = (currentCounts[c] || 0) + (lastCounts[c] || 0);
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-color" style="background:${pastelColors[i]}"></div>
      <span>${c.charAt(0).toUpperCase() + c.slice(1)} (${total})</span>
    `;
    legendBox.appendChild(item);
  });
}
updateLegend();

const monthsAvailable = [currentMonth, lastMonth];
monthsAvailable.forEach((month, index) => {
  const btn = document.createElement('button');
  btn.textContent = month;
  btn.classList.add('active');
  btn.onclick = () => {
    const ds = complaintChart.data.datasets[index];
    const visible = ds.hidden = !ds.hidden;
    btn.classList.toggle('active', !visible);
    complaintChart.update();
  };
  toggleContainer.appendChild(btn);
});
const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('show');
  });