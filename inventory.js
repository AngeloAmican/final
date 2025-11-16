
const STORAGE_KEY = 'med-inventory-v2';
let medicines = [];
let editingId = null;

// --- Sample Data ---
const sample = [
  {id: genId(), name: 'Paracetamol', strength:'500mg', category:'Analgesic', supplier:'PharmaCorp', quantity:150, unit:'tablets', batch:'PARA-2024-001', expiry:'2025-12-31', condition:'Good'},
  {id: genId(), name: 'Amoxicillin', strength:'250mg', category:'Antibiotic', supplier:'MediSupply', quantity:30, unit:'capsules', batch:'AMOX-2024-002', expiry:'2025-03-15', condition:'Good'},
  {id: genId(), name: 'Ibuprofen', strength:'400mg', category:'Anti-inflammatory', supplier:'PharmaCorp', quantity:0, unit:'tablets', batch:'IBU-2024-003', expiry:'2025-01-20', condition:'Damaged'},
];

function genId(){return 'id_'+Math.random().toString(36).slice(2,9);}
function save(){localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));}
function load(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){medicines = sample; save();}
  else medicines = JSON.parse(raw);
}

function daysBetween(a,b){return Math.round((a-b)/(24*60*60*1000));}
function statusFor(expiryStr, qty){
  const today = new Date();
  const exp = new Date(expiryStr+'T00:00:00');
  const days = daysBetween(exp, today);
  if(days < 0) return {cls:'expired', text:'EXPIRED'};
  if(days <= 90) return {cls:'expires-soon', text:`EXPIRES IN ${days} DAYS`};
  if(qty === 0) return {cls:'out', text:'OUT OF STOCK'};
  if(qty <= 30) return {cls:'low', text:'LOW STOCK'};
  return {cls:'ok', text:'OK'};
}

function render(){
  const tbody = document.getElementById('tbody'); tbody.innerHTML='';
  const search = document.getElementById('search').value.trim().toLowerCase();
  let expCount=0, lowStock=0, outStock=0;
  
  medicines.forEach(m=>{
    const matches = !search || [m.name,m.category,m.batch,m.supplier,m.strength].join(' ').toLowerCase().includes(search);
    if(!matches) return;
    
    const st = statusFor(m.expiry, m.quantity);
    if(st.cls==='expired') expCount++;
    if(m.quantity<=30 && m.quantity>0) lowStock++;
    if(m.quantity===0) outStock++;
    
    // color coding for condition
    let condColor = '#777';
    if(m.condition){
      const cond = m.condition.toLowerCase();
      if(cond.includes('damage')) condColor = '#d9534f';      
      else if(cond.includes('lost')) condColor = '#f0ad4e';   
      else if(cond.includes('return')) condColor = '#5bc0de'; 
      else if(cond.includes('good')) condColor = '#5cb85c';   
    }
    const condBadge = m.condition ? `<div style="background:${condColor};color:#fff;padding:3px 6px;border-radius:4px;font-size:12px;display:inline-block;margin-top:3px">${escapeHtml(m.condition)}</div>` : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="row-title">${escapeHtml(m.name)}
          <div style="font-weight:600;font-size:13px;color:#a33">${escapeHtml(m.strength)}</div>
        </div>
        <div class="muted">${escapeHtml(m.supplier)}</div>
        ${condBadge}
      </td>
      <td>${escapeHtml(m.category)}</td>
      <td>
        <div style="font-weight:700">${m.quantity} <span class="small">${escapeHtml(m.unit)}</span></div>
        ${m.quantity===0? '<div class="lowstock" style="background:#000;color:#fff">OUT OF STOCK</div>':''}
        ${m.quantity<=30 && m.quantity>0? '<div class="lowstock">LOW STOCK</div>':''}
      </td>
      <td>${escapeHtml(m.batch)}</td>
      <td>${escapeHtml(m.expiry)}</td>
      <td><span class="badge ${st.cls}">${st.text}</span></td>
      <td class="actions"><button data-id="${m.id}" class="editBtn">✎ Edit</button></td>
    `;
    tbody.appendChild(tr);
  });
  
  document.getElementById('expiringCount').textContent = expCount;
  document.getElementById('lowStockCount').textContent = lowStock + outStock;
  attachEditHandlers();
}

function attachEditHandlers(){
  document.querySelectorAll('.editBtn').forEach(b=>{
    b.onclick = ()=>openModalFor(b.dataset.id);
  });
}

function openModalFor(id){
  editingId = id || null;
  document.getElementById('modalTitle').textContent = id? 'Edit medicine' : 'Add medicine';
  const fields = ['mName','mStrength','mCategory','mSupplier','mQuantity','mUnit','mBatch','mExpiry'];
  if(id){
    const m = medicines.find(x=>x.id===id);
    fields.forEach(f=>document.getElementById(f).value = m[f.replace('m','').toLowerCase()] || '');
  } else fields.forEach(f=>document.getElementById(f).value = '');
  document.getElementById('modal').classList.add('open');
}

function closeModal(){document.getElementById('modal').classList.remove('open'); editingId=null;}

document.getElementById('openAdd').addEventListener('click', ()=>openModalFor());
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('search').addEventListener('input', render);


document.getElementById('saveBtn').addEventListener('click', ()=>{
  const data = {
    name: document.getElementById('mName').value.trim(),
    strength: document.getElementById('mStrength').value.trim(),
    category: document.getElementById('mCategory').value.trim(),
    supplier: document.getElementById('mSupplier').value.trim(),
    quantity: parseInt(document.getElementById('mQuantity').value||0,10),
    unit: document.getElementById('mUnit').value.trim(),
    batch: document.getElementById('mBatch').value.trim(),
    expiry: document.getElementById('mExpiry').value.trim()
  };
  if(!data.name || !data.expiry){ alert('Please provide at least name and expiration date.'); return; }

  if(editingId){

    const target = medicines.find(x=>x.id===editingId);
    if(!target) { alert('Item not found.'); return; }
    Object.assign(target, data);

    const existing = target.condition || '';
    const note = prompt("Any condition to note? (e.g. Damaged / Lost / Returned / Good) Leave blank to clear:", existing);
    if(note === null){

    } else {
      target.condition = note.trim();
      if(target.condition === '') delete target.condition;
    }
  } else {
    data.id = genId();
    const note = prompt("Any condition to note? (e.g. Damaged / Lost / Returned / Good) Leave blank if none:");
    if(note && note.trim()) data.condition = note.trim();
    medicines.unshift(data);
  }

  save();
  render();
  closeModal();
});

function escapeHtml(s){return String(s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}

load(); render();
document.addEventListener('keydown', e=>{if(e.key==='Escape') closeModal();});
window.resetInventory = ()=>{if(confirm('Reset inventory to sample data?')){medicines = sample; save(); render();}}
