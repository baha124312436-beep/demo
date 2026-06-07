/* ============================================================
   HemoICU Monitor — Main Application
   ============================================================ */

// ── Data Store ──────────────────────────────────────────────
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem('hemo_' + key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem('hemo_' + key, JSON.stringify(val)); },
  genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
};

// ── State ────────────────────────────────────────────────────
let currentPage = 'dashboard';
let selectedPatientId = null;

// ── Initial Demo Data ────────────────────────────────────────
function initDemoData() {
  if (!DB.get('consiliums')) DB.set('consiliums', []);
  if (DB.get('patients').length) return;
  const patients = [
    {
      id: 'p1', name: 'Алматова Айгерим Серикқызы', iin: '850312300145',
      age: 41, diagnosis: 'ОМЛ', ward: 'ОРИТ', room: '1',
      doctor: 'Жаксыбеков А.М.', admitDate: '2026-06-01', zone: 'red',
      vitals: { temp: 39.2, sbp: 85, dbp: 50, hr: 118, rr: 26, spo2: 88, urine: 420 },
      resp: 'NIV', gcs: 12, delirium: true,
      labs: { hb: 62, wbc: 0.5, neutro: 0.08, plt: 8, creat: 198, urea: 18, alt: 67, ast: 89, bili: 34, alb: 24, mno: 2.1, aptt: 68, fibr: 1.2, ddimer: 8.4, crp: 210, pct: 12.4, ferr: 18000, lactate: 5.2 },
      complications: ['Септический шок','Инвазивный микоз','ДВС-синдром','Полиорганная недостаточность'],
      therapy: [
        { name: 'Меропенем', dose: '2 г х 3', start: '2026-06-01', type: 'АБ' },
        { name: 'Каспофунгин', dose: '70 мг х 1', start: '2026-06-01', type: 'ПГ' },
        { name: 'НФГ', dose: '500 ЕД/час', start: '2026-06-03', type: 'АКГ' }
      ],
      transfusions: [
        { type: 'ЭМ', date: '2026-06-05', vol: 340, reaction: false },
        { type: 'ТК', date: '2026-06-04', vol: 250, reaction: false },
        { type: 'СЗП', date: '2026-06-03', vol: 600, reaction: true }
      ]
    },
    {
      id: 'p2', name: 'Бекенов Санжар Дүйсенович', iin: '920715300266',
      age: 34, diagnosis: 'ОЛЛ', ward: 'ПИТ', room: '3',
      doctor: 'Жаксыбеков А.М.', admitDate: '2026-06-03', zone: 'yellow',
      vitals: { temp: 38.5, sbp: 100, dbp: 65, hr: 98, rr: 20, spo2: 94, urine: 1100 },
      resp: 'O2', gcs: 15, delirium: false,
      labs: { hb: 78, wbc: 1.2, neutro: 0.4, plt: 22, creat: 124, urea: 12, alt: 45, ast: 52, bili: 22, alb: 31, mno: 1.6, aptt: 48, fibr: 2.1, ddimer: 3.2, crp: 128, pct: 4.2, ferr: 4500, lactate: 2.1 },
      complications: ['Септицемия','Кровотечение'],
      therapy: [
        { name: 'Ванкомицин', dose: '1 г х 2', start: '2026-06-03', type: 'АБ' },
        { name: 'Позаконазол', dose: '300 мг х 1', start: '2026-06-03', type: 'ПГ' }
      ],
      transfusions: [
        { type: 'ЭМ', date: '2026-06-05', vol: 340, reaction: false }
      ]
    },
    {
      id: 'p3', name: 'Назарова Дина Рашидовна', iin: '780920400387',
      age: 48, diagnosis: 'ММ', ward: 'ПИТ', room: '4',
      doctor: 'Серікқали Б.Т.', admitDate: '2026-06-04', zone: 'yellow',
      vitals: { temp: 37.8, sbp: 110, dbp: 70, hr: 88, rr: 18, spo2: 96, urine: 1350 },
      resp: 'O2', gcs: 15, delirium: false,
      labs: { hb: 91, wbc: 2.8, neutro: 1.2, plt: 55, creat: 156, urea: 14, alt: 32, ast: 38, bili: 18, alb: 33, mno: 1.4, aptt: 42, fibr: 2.8, ddimer: 1.8, crp: 78, pct: 1.8, ferr: 2200, lactate: 1.4 },
      complications: ['Почечная недостаточность','Тромбоз'],
      therapy: [
        { name: 'Бортезомиб', dose: '1.3 мг/м² х 1', start: '2026-05-28', type: 'ХТ' },
        { name: 'Дексаметазон', dose: '40 мг х 1/нед', start: '2026-05-28', type: 'ГКС' },
        { name: 'Дальтепарин', dose: '5000 МЕ х 1', start: '2026-06-01', type: 'АКГ' }
      ],
      transfusions: []
    },
    {
      id: 'p4', name: 'Сейтжанов Руслан Маратович', iin: '001224300498',
      age: 26, diagnosis: 'АА', ward: 'ПИТ', room: '5',
      doctor: 'Серікқали Б.Т.', admitDate: '2026-06-05', zone: 'green',
      vitals: { temp: 37.2, sbp: 120, dbp: 75, hr: 76, rr: 16, spo2: 98, urine: 1680 },
      resp: 'нет', gcs: 15, delirium: false,
      labs: { hb: 105, wbc: 3.4, neutro: 1.8, plt: 88, creat: 88, urea: 7, alt: 28, ast: 31, bili: 12, alb: 38, mno: 1.1, aptt: 36, fibr: 3.2, ddimer: 0.8, crp: 22, pct: 0.4, ferr: 890, lactate: 0.9 },
      complications: [],
      therapy: [
        { name: 'Циклоспорин А', dose: '3 мг/кг х 2', start: '2026-06-05', type: 'ИТ' },
        { name: 'АТГ лошадиный', dose: '40 мг/кг х 4дн', start: '2026-06-05', type: 'ИТ' }
      ],
      transfusions: [
        { type: 'ЭМ', date: '2026-06-06', vol: 340, reaction: false },
        { type: 'ТК', date: '2026-06-06', vol: 250, reaction: false }
      ]
    }
  ];
  DB.set('patients', patients);
}

// ── Scores Calculation ───────────────────────────────────────
function calcNEWS2(v, labs) {
  let score = 0;
  // SpO2
  if (v.spo2 <= 91) score += 3; else if (v.spo2 <= 93) score += 2; else if (v.spo2 <= 94) score += 1;
  // Resp rate
  if (v.rr <= 8 || v.rr >= 25) score += 3; else if (v.rr >= 21) score += 2; else if (v.rr <= 11) score += 1;
  // Temp
  if (v.temp <= 35) score += 3; else if (v.temp >= 39.1) score += 2; else if ((v.temp >= 35.1 && v.temp <= 36) || (v.temp >= 38.1 && v.temp <= 39)) score += 1;
  // SBP
  if (v.sbp <= 90 || v.sbp >= 220) score += 3; else if (v.sbp <= 100) score += 2; else if (v.sbp <= 110) score += 1;
  // HR
  if (v.hr <= 40 || v.hr >= 131) score += 3; else if (v.hr >= 111) score += 2; else if (v.hr <= 50 || v.hr >= 91) score += 1;
  // GCS < 15
  if (v.gcs !== undefined && v.gcs < 15) score += 3;
  return score;
}

function calcSOFA(v, labs) {
  let score = 0;
  if (!labs) return 0;
  // Resp (SpO2 proxy)
  if (v.spo2 < 90) score += 3; else if (v.spo2 < 94) score += 2; else if (v.spo2 < 96) score += 1;
  // Coagulation (Plt)
  if (labs.plt < 20) score += 3; else if (labs.plt < 50) score += 2; else if (labs.plt < 100) score += 1;
  // Liver (Bili)
  if (labs.bili >= 204) score += 4; else if (labs.bili >= 102) score += 3; else if (labs.bili >= 33) score += 2; else if (labs.bili >= 20) score += 1;
  // Renal (Creat)
  if (labs.creat > 440) score += 4; else if (labs.creat > 300) score += 3; else if (labs.creat > 170) score += 2; else if (labs.creat > 110) score += 1;
  // Neuro (GCS)
  if (v.gcs < 6) score += 4; else if (v.gcs < 10) score += 3; else if (v.gcs < 13) score += 2; else if (v.gcs < 15) score += 1;
  // Cardiovascular (MAP/vasopressors — approx from BP)
  const map = Math.round(v.dbp + (v.sbp - v.dbp) / 3);
  if (map < 70) score += 1;
  return score;
}

function calcqSOFA(v) {
  let score = 0;
  if (v.rr >= 22) score++;
  if (v.sbp <= 100) score++;
  if (v.gcs !== undefined && v.gcs < 15) score++;
  return score;
}

function calcMASCC(p) {
  // Simplified MASCC
  let score = 21; // burden mild = 5, no hypotension = 5, no COPD = 4, solid tumor/lymphoma = 4, outpatient = 3
  if (p.vitals.sbp < 90) score -= 5;
  return score;
}

function getZone(p) {
  const v = p.vitals; const labs = p.labs;
  const sofa = calcSOFA(v, labs);
  const news = calcNEWS2(v, labs);
  if (sofa >= 8 || news >= 7 || (labs && labs.lactate > 4) || v.spo2 < 90 || (labs && labs.plt < 10) || (labs && labs.neutro < 0.1)) return 'red';
  if (sofa >= 4 || news >= 5 || v.spo2 < 94 || (labs && labs.plt < 30) || (labs && labs.neutro < 0.5)) return 'yellow';
  return 'green';
}

function sofaLevel(s) { if (s >= 11) return ['high','Высокий риск']; if (s >= 6) return ['medium','Умеренный']; return ['low','Низкий']; }
function newsLevel(s) { if (s >= 7) return ['high','Критический']; if (s >= 5) return ['medium','Средний']; if (s >= 1) return ['low','Низкий']; return ['low','Норма']; }
function qsofaLevel(s) { if (s >= 2) return ['high','Сепсис вероятен']; return ['low','Низкий риск']; }

// ── Utilities ────────────────────────────────────────────────
function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}
function fmt(n, dec = 1) { return n !== undefined && n !== '' ? Number(n).toFixed(dec) : '—'; }
function fmtDate(str) { if (!str) return '—'; const d = new Date(str); return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function today() { return new Date().toISOString().split('T')[0]; }

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show ' + type;
  setTimeout(() => t.className = 'toast', 3000);
}

// ── Router ───────────────────────────────────────────────────
const pageNames = {
  dashboard: 'Панель мониторинга', patients: 'Реестр пациентов',
  monitoring: 'Мониторинг витальных', laboratory: 'Лабораторный мониторинг',
  scores: 'Расчет рисков', complications: 'Осложнения',
  therapy: 'Лекарственная терапия', transfusion: 'Трансфузионная поддержка',
  consilium: 'Консилиум РВК при РЦК',
  rounds: 'Обход заведующего', analytics: 'Аналитика отделения'
};

function navigate(page, patientId = null) {
  currentPage = page;
  selectedPatientId = patientId;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.getElementById('pageTitle').textContent = pageNames[page] || page;
  renderPage();
}

function renderPage() {
  const el = document.getElementById('pageContent');
  const renderers = {
    dashboard, patients, monitoring, laboratory, scores,
    complications, therapy, transfusion, consilium, rounds, analytics
  };
  el.innerHTML = '';
  if (renderers[currentPage]) el.innerHTML = renderers[currentPage]();
  else el.innerHTML = '<p>Страница не найдена</p>';
}

// ── Zone Badge ───────────────────────────────────────────────
function zoneBadge(zone) {
  if (zone === 'red') return '<span class="badge badge-red"><span class="dot dot-red"></span> Красная</span>';
  if (zone === 'yellow') return '<span class="badge badge-yellow"><span class="dot dot-yellow"></span> Жёлтая</span>';
  return '<span class="badge badge-green"><span class="dot dot-green"></span> Зелёная</span>';
}

// ══════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════════
function dashboard() {
  const pts = DB.get('patients');
  const red = pts.filter(p => getZone(p) === 'red');
  const yellow = pts.filter(p => getZone(p) === 'yellow');
  const green = pts.filter(p => getZone(p) === 'green');
  const icu = pts.filter(p => p.ward === 'ОРИТ');
  const pit = pts.filter(p => p.ward === 'ПИТ');
  const onVent = pts.filter(p => p.resp === 'ИВЛ');
  const sepsis = pts.filter(p => p.complications && (p.complications.includes('Сепсис') || p.complications.includes('Септический шок')));
  const fn = pts.filter(p => p.complications && p.complications.includes('Некоторый'));

  const redAlerts = red.map(p => {
    const s = calcSOFA(p.vitals, p.labs);
    const n = calcNEWS2(p.vitals, p.labs);
    const reasons = [];
    if (s >= 8) reasons.push('SOFA ' + s);
    if (n >= 7) reasons.push('NEWS2 ' + n);
    if (p.labs && p.labs.lactate > 4) reasons.push('Лактат ' + p.labs.lactate);
    if (p.vitals.spo2 < 90) reasons.push('SpO2 ' + p.vitals.spo2 + '%');
    if (p.labs && p.labs.plt < 10) reasons.push('Тр ' + p.labs.plt);
    if (p.labs && p.labs.neutro < 0.1) reasons.push('Ней ' + p.labs.neutro);
    return `<div class="notification-bar">
      <span class="icon">🚨</span>
      <div><strong>${p.name}</strong> — ${p.diagnosis}, ${p.ward}<br>
      <span style="font-size:12px;color:var(--red-dark)">${reasons.join(' · ')}</span></div>
      <button class="btn btn-sm btn-secondary" style="margin-left:auto" onclick="navigate('patients','${p.id}')">Открыть</button>
    </div>`;
  }).join('');

  return `
  ${redAlerts}
  <div class="grid grid-4" style="margin-bottom:20px">
    <div class="stat-card red"><div class="stat-label">Красная зона</div><div class="stat-value">${red.length}</div><div class="stat-sub">Критическое состояние</div></div>
    <div class="stat-card yellow"><div class="stat-label">Жёлтая зона</div><div class="stat-value">${yellow.length}</div><div class="stat-sub">Требует внимания</div></div>
    <div class="stat-card green"><div class="stat-label">Зелёная зона</div><div class="stat-value">${green.length}</div><div class="stat-sub">Стабильное состояние</div></div>
    <div class="stat-card blue"><div class="stat-label">Всего пациентов</div><div class="stat-value">${pts.length}</div><div class="stat-sub">ОРИТ: ${icu.length} · ПИТ: ${pit.length}</div></div>
  </div>

  <div class="grid grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-header"><div class="card-title">📊 Сводка по отделению</div></div>
      <div class="grid grid-2" style="gap:10px">
        <div style="background:var(--gray-50);border-radius:8px;padding:12px;border-left:3px solid var(--red)">
          <div style="font-size:11px;color:var(--gray-500);font-weight:600">ОРИТ</div>
          <div style="font-size:22px;font-weight:700">${icu.length} <small style="font-size:13px;color:var(--gray-400)">пац.</small></div>
        </div>
        <div style="background:var(--gray-50);border-radius:8px;padding:12px;border-left:3px solid var(--yellow)">
          <div style="font-size:11px;color:var(--gray-500);font-weight:600">ПИТ</div>
          <div style="font-size:22px;font-weight:700">${pit.length} <small style="font-size:13px;color:var(--gray-400)">пац.</small></div>
        </div>
        <div style="background:var(--gray-50);border-radius:8px;padding:12px;border-left:3px solid var(--purple)">
          <div style="font-size:11px;color:var(--gray-500);font-weight:600">На ИВЛ</div>
          <div style="font-size:22px;font-weight:700">${onVent.length}</div>
        </div>
        <div style="background:var(--gray-50);border-radius:8px;padding:12px;border-left:3px solid var(--blue)">
          <div style="font-size:11px;color:var(--gray-500);font-weight:600">Сепсис/шок</div>
          <div style="font-size:22px;font-weight:700">${sepsis.length}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">⚠️ Критические параметры</div></div>
      ${pts.map(p => {
        const alerts = [];
        if (p.labs && p.labs.neutro < 0.5) alerts.push({label:'Нейтропения', val: p.labs.neutro + '×10⁹', color:'red'});
        if (p.labs && p.labs.plt < 30) alerts.push({label:'Тромбоцитопения', val: p.labs.plt + '×10⁹', color:'red'});
        if (p.vitals.spo2 < 94) alerts.push({label:'SpO2', val: p.vitals.spo2 + '%', color:'red'});
        if (p.labs && p.labs.pct > 2) alerts.push({label:'ПКТ', val: p.labs.pct + ' нг/мл', color:'yellow'});
        if (!alerts.length) return '';
        return `<div style="margin-bottom:10px">
          <div style="font-size:12px;font-weight:600;color:var(--gray-600);margin-bottom:4px">${p.name.split(' ')[0]} ${p.name.split(' ')[1]}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">${alerts.map(a =>
            `<span class="badge badge-${a.color === 'red' ? 'red':'yellow'}">${a.label}: ${a.val}</span>`
          ).join('')}</div>
        </div>`;
      }).join('') || '<p style="color:var(--gray-400);font-size:13px">Критических отклонений нет</p>'}
    </div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">🏥 Пациенты</div><button class="btn btn-sm btn-secondary" onclick="navigate('patients')">Все пациенты →</button></div>
    <div class="patient-grid">
      ${pts.map(p => patientMiniCard(p)).join('')}
    </div>
  </div>`;
}

function patientMiniCard(p) {
  const zone = getZone(p);
  const sofa = calcSOFA(p.vitals, p.labs);
  const news = calcNEWS2(p.vitals, p.labs);
  return `<div class="patient-card zone-${zone}" onclick="navigate('patients','${p.id}')">
    <div class="patient-card-header">
      <div>
        <div class="patient-name">${p.name}</div>
        <div class="patient-meta">${p.age} лет · ${p.ward} · Пал. ${p.room}</div>
      </div>
      ${zoneBadge(zone)}
    </div>
    <div class="patient-card-body">
      <div class="patient-dx">${p.diagnosis}</div>
      <div class="vitals-mini">
        <div class="vital-chip">T <span>${fmt(p.vitals.temp)}°C</span></div>
        <div class="vital-chip">АД <span>${p.vitals.sbp}/${p.vitals.dbp}</span></div>
        <div class="vital-chip">ЧСС <span>${p.vitals.hr}</span></div>
        <div class="vital-chip">SpO2 <span>${p.vitals.spo2}%</span></div>
        <div class="vital-chip">Тр <span>${p.labs?.plt ?? '—'}</span></div>
        <div class="vital-chip">Ней <span>${p.labs?.neutro ?? '—'}</span></div>
      </div>
    </div>
    <div class="patient-card-footer">
      <div class="score-badges">
        <span class="score-chip sofa">SOFA: ${sofa}</span>
        <span class="score-chip news">NEWS2: ${news}</span>
      </div>
      <span style="font-size:11px;color:var(--gray-400)">${daysSince(p.admitDate)} дн.</span>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// PAGE: PATIENTS
// ══════════════════════════════════════════════════════════════
function patients() {
  if (selectedPatientId) return patientDetail(selectedPatientId);
  const pts = DB.get('patients');
  return `
  <div class="filter-bar">
    <input type="text" placeholder="Поиск пациента..." id="patSearch" oninput="filterPatients()" style="max-width:250px">
    <select class="filter-select" id="patWard" onchange="filterPatients()">
      <option value="">Все отделения</option>
      <option>ОРИТ</option><option>ПИТ</option>
    </select>
    <select class="filter-select" id="patZone" onchange="filterPatients()">
      <option value="">Все зоны</option>
      <option value="red">Красная</option>
      <option value="yellow">Жёлтая</option>
      <option value="green">Зелёная</option>
    </select>
    <select class="filter-select" id="patDx" onchange="filterPatients()">
      <option value="">Все диагнозы</option>
      ${['ОМЛ','ОЛЛ','МДС','ММ','Лимфомы','ХМЛ','ПНГ','АА'].map(d=>`<option>${d}</option>`).join('')}
    </select>
  </div>
  <div class="patient-grid" id="patientGrid">
    ${pts.map(p => patientMiniCard(p)).join('')}
  </div>`;
}

function filterPatients() {
  const q = document.getElementById('patSearch')?.value.toLowerCase() || '';
  const ward = document.getElementById('patWard')?.value || '';
  const zone = document.getElementById('patZone')?.value || '';
  const dx = document.getElementById('patDx')?.value || '';
  const pts = DB.get('patients').filter(p => {
    if (q && !p.name.toLowerCase().includes(q) && !p.iin.includes(q)) return false;
    if (ward && p.ward !== ward) return false;
    if (zone && getZone(p) !== zone) return false;
    if (dx && p.diagnosis !== dx) return false;
    return true;
  });
  const grid = document.getElementById('patientGrid');
  if (grid) grid.innerHTML = pts.length ? pts.map(p => patientMiniCard(p)).join('') :
    '<p style="color:var(--gray-400);padding:20px">Пациенты не найдены</p>';
}

// ── Patient Detail ───────────────────────────────────────────
function patientDetail(id) {
  const p = DB.get('patients').find(x => x.id === id);
  if (!p) return '<p>Пациент не найден</p>';
  const zone = getZone(p);
  const sofa = calcSOFA(p.vitals, p.labs);
  const news = calcNEWS2(p.vitals, p.labs);
  const qsofa = calcqSOFA(p.vitals);
  const [sofaC, sofaL] = sofaLevel(sofa);
  const [newsC, newsL] = newsLevel(news);
  const [qC, qL] = qsofaLevel(qsofa);
  const map = Math.round(p.vitals.dbp + (p.vitals.sbp - p.vitals.dbp) / 3);

  return `
  <div class="detail-header">
    <div class="back-btn" onclick="selectedPatientId=null;navigate('patients')">
      ← Назад
    </div>
    <h2 style="font-size:18px;font-weight:700;flex:1">${p.name}</h2>
    ${zoneBadge(zone)}
    <button class="btn btn-secondary btn-sm" onclick="showEditPatientModal('${p.id}')">Редактировать</button>
    <button class="btn btn-primary btn-sm" onclick="showAddVitalsModal('${p.id}')">+ Витальные</button>
  </div>

  <div class="grid grid-4" style="margin-bottom:20px">
    <div class="stat-card blue"><div class="stat-label">Диагноз</div><div style="font-size:18px;font-weight:700">${p.diagnosis}</div><div class="stat-sub">${p.ward} · Пал. ${p.room}</div></div>
    <div class="stat-card"><div class="stat-label">Возраст / ИИН</div><div style="font-size:18px;font-weight:700">${p.age} лет</div><div class="stat-sub">${p.iin}</div></div>
    <div class="stat-card"><div class="stat-label">Госпитализирован</div><div style="font-size:18px;font-weight:700">${daysSince(p.admitDate)} дн.</div><div class="stat-sub">${fmtDate(p.admitDate)}</div></div>
    <div class="stat-card"><div class="stat-label">Врач</div><div style="font-size:14px;font-weight:700;margin-top:4px">${p.doctor}</div></div>
  </div>

  <div class="grid grid-2" style="margin-bottom:16px">
    <div class="card">
      <div class="card-header"><div class="card-title">🫀 Витальные показатели</div></div>
      <div class="grid grid-3" style="gap:10px">
        ${vital('🌡', 'Температура', fmt(p.vitals.temp) + '°C', p.vitals.temp >= 38 ? 'red' : p.vitals.temp <= 35.5 ? 'yellow' : 'green')}
        ${vital('🩸', 'АД', p.vitals.sbp + '/' + p.vitals.dbp, p.vitals.sbp < 90 ? 'red' : p.vitals.sbp < 100 ? 'yellow' : 'green')}
        ${vital('💓', 'ЧСС', p.vitals.hr + ' уд/мин', p.vitals.hr > 120 || p.vitals.hr < 50 ? 'red' : p.vitals.hr > 100 ? 'yellow' : 'green')}
        ${vital('💨', 'ЧДД', p.vitals.rr + ' /мин', p.vitals.rr >= 25 ? 'red' : p.vitals.rr >= 20 ? 'yellow' : 'green')}
        ${vital('🫁', 'SpO2', p.vitals.spo2 + '%', p.vitals.spo2 < 90 ? 'red' : p.vitals.spo2 < 94 ? 'yellow' : 'green')}
        ${vital('💧', 'Диурез', p.vitals.urine + ' мл/сут', p.vitals.urine < 500 ? 'red' : p.vitals.urine < 800 ? 'yellow' : 'green')}
      </div>
      <div class="divider"></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div><span style="font-size:12px;color:var(--gray-500)">Дыхание: </span><strong>${p.resp}</strong></div>
        <div><span style="font-size:12px;color:var(--gray-500)">GCS: </span><strong>${p.gcs}/15</strong></div>
        <div><span style="font-size:12px;color:var(--gray-500)">Делирий: </span><strong>${p.delirium ? '⚠️ Да' : 'Нет'}</strong></div>
        <div><span style="font-size:12px;color:var(--gray-500)">MAP: </span><strong>${map} мм.рт.ст.</strong></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📊 Шкалы риска</div></div>
      <div class="scores-grid">
        <div class="score-box ${sofaC}">
          <div class="score-big" style="color:${sofaC==='high'?'var(--red)':sofaC==='medium'?'var(--yellow)':'var(--green)'}">${sofa}</div>
          <div class="score-name">SOFA</div>
          <div class="score-level">${sofaL}</div>
        </div>
        <div class="score-box ${newsC}">
          <div class="score-big" style="color:${newsC==='high'?'var(--red)':newsC==='medium'?'var(--yellow)':'var(--green)'}">${news}</div>
          <div class="score-name">NEWS2</div>
          <div class="score-level">${newsL}</div>
        </div>
        <div class="score-box ${qC}">
          <div class="score-big" style="color:${qC==='high'?'var(--red)':'var(--green)'}">${qsofa}</div>
          <div class="score-name">qSOFA</div>
          <div class="score-level">${qL}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-2" style="margin-bottom:16px">
    <div class="card">
      <div class="card-header"><div class="card-title">🧪 Лабораторные данные</div></div>
      ${labTable(p.labs)}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">⚠️ Осложнения</div></div>
      ${p.complications && p.complications.length
        ? p.complications.map(c => `<div class="alert alert-red" style="margin-bottom:8px">🔴 ${c}</div>`).join('')
        : '<p style="color:var(--gray-400);font-size:13px">Осложнений не зарегистрировано</p>'}
    </div>
  </div>

  <div class="grid grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">💊 Терапия</div></div>
      ${(p.therapy || []).map(t => therapyItem(t)).join('') || '<p style="color:var(--gray-400);font-size:13px">Терапия не назначена</p>'}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🩸 Трансфузии</div></div>
      ${(p.transfusions || []).map(t => `
        <div class="transfusion-type">
          <span class="blood-icon">${t.type==='ЭМ'?'🔴':t.type==='ТК'?'🟡':t.type==='СЗП'?'🟠':'🟤'}</span>
          <div style="flex:1"><div style="font-weight:600;font-size:13px">${t.type}</div><div style="font-size:11px;color:var(--gray-500)">${fmtDate(t.date)} · ${t.vol} мл</div></div>
          ${t.reaction ? '<span class="badge badge-red">Реакция!</span>' : '<span class="badge badge-green">Без реакций</span>'}
        </div>`).join('') || '<p style="color:var(--gray-400);font-size:13px">Трансфузий не проводилось</p>'}
    </div>
  </div>`;
}

function vital(icon, label, val, color) {
  const bg = color === 'red' ? 'var(--red-light)' : color === 'yellow' ? 'var(--yellow-light)' : 'var(--green-light)';
  const cl = color === 'red' ? 'var(--red-dark)' : color === 'yellow' ? '#92400e' : '#14532d';
  return `<div style="background:${bg};border-radius:8px;padding:10px;text-align:center">
    <div style="font-size:18px">${icon}</div>
    <div style="font-size:11px;color:${cl};font-weight:600">${label}</div>
    <div style="font-size:14px;font-weight:700;color:${cl}">${val}</div>
  </div>`;
}

function labTable(labs) {
  if (!labs) return '<p style="color:var(--gray-400)">Нет данных</p>';
  const rows = [
    ['Hb', labs.hb, 'г/л', labs.hb < 70 ? 'red' : labs.hb < 80 ? 'yellow' : ''],
    ['Лейкоциты', labs.wbc, '×10⁹/л', labs.wbc < 1 ? 'red' : labs.wbc < 2 ? 'yellow' : ''],
    ['Нейтрофилы', labs.neutro, '×10⁹/л', labs.neutro < 0.1 ? 'red' : labs.neutro < 0.5 ? 'yellow' : ''],
    ['Тромбоциты', labs.plt, '×10⁹/л', labs.plt < 10 ? 'red' : labs.plt < 30 ? 'yellow' : ''],
    ['Креатинин', labs.creat, 'мкмоль/л', labs.creat > 300 ? 'red' : labs.creat > 170 ? 'yellow' : ''],
    ['Билирубин', labs.bili, 'мкмоль/л', labs.bili > 100 ? 'red' : labs.bili > 33 ? 'yellow' : ''],
    ['МНО', labs.mno, '', labs.mno > 2 ? 'red' : labs.mno > 1.5 ? 'yellow' : ''],
    ['D-димер', labs.ddimer, 'мкг/мл', labs.ddimer > 5 ? 'red' : labs.ddimer > 1 ? 'yellow' : ''],
    ['ПКТ', labs.pct, 'нг/мл', labs.pct > 10 ? 'red' : labs.pct > 2 ? 'yellow' : ''],
    ['CRP', labs.crp, 'мг/л', labs.crp > 150 ? 'red' : labs.crp > 80 ? 'yellow' : ''],
    ['Ферритин', labs.ferr, 'мкг/л', labs.ferr > 10000 ? 'red' : labs.ferr > 3000 ? 'yellow' : ''],
    ['Лактат', labs.lactate, 'ммоль/л', labs.lactate > 4 ? 'red' : labs.lactate > 2 ? 'yellow' : ''],
  ];
  return `<div class="table-wrap"><table>
    <thead><tr><th>Показатель</th><th>Значение</th><th>Ед.</th><th>Статус</th></tr></thead>
    <tbody>${rows.map(([name, val, unit, color]) => `<tr>
      <td>${name}</td>
      <td style="font-weight:600;color:${color==='red'?'var(--red)':color==='yellow'?'var(--yellow)':'inherit'}">${val ?? '—'}</td>
      <td style="color:var(--gray-400)">${unit}</td>
      <td>${color==='red'?'<span class="badge badge-red">Критично</span>':color==='yellow'?'<span class="badge badge-yellow">Внимание</span>':'<span class="badge badge-green">Норма</span>'}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function therapyItem(t) {
  const days = daysSince(t.start);
  const isLong = days >= 7;
  return `<div class="therapy-item">
    <div style="min-width:36px;height:36px;border-radius:8px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:var(--blue);margin-right:10px">${t.type}</div>
    <div class="therapy-info">
      <div class="therapy-name">${t.name}</div>
      <div class="therapy-meta">${t.dose} · Начато: ${fmtDate(t.start)} · ${days} дн.</div>
      ${isLong ? `<div class="therapy-alert danger">⚠ Терапия ${days} дней — требуется пересмотр</div>` : ''}
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// PAGE: MONITORING
// ══════════════════════════════════════════════════════════════
function monitoring() {
  const pts = DB.get('patients');
  return `
  <div class="card" style="margin-bottom:16px">
    <div class="card-header"><div class="card-title">📈 Витальные показатели — все пациенты</div></div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Пациент</th><th>Зона</th><th>T °C</th><th>АД</th><th>ЧСС</th><th>ЧДД</th>
          <th>SpO2</th><th>Диурез</th><th>Дыхание</th><th>GCS</th><th>Действия</th>
        </tr></thead>
        <tbody>
          ${pts.map(p => {
            const z = getZone(p); const v = p.vitals;
            return `<tr>
              <td><strong>${p.name.split(' ').slice(0,2).join(' ')}</strong><br><span style="font-size:11px;color:var(--gray-500)">${p.diagnosis} · ${p.ward}</span></td>
              <td>${zoneBadge(z)}</td>
              <td class="${v.temp>=38.5?'text-red':v.temp>=38?'text-yellow':''}" style="font-weight:600;color:${v.temp>=38.5?'var(--red)':v.temp>=38?'var(--yellow)':'inherit'}">${fmt(v.temp)}</td>
              <td style="font-weight:600;color:${v.sbp<90?'var(--red)':v.sbp<100?'var(--yellow)':'inherit'}">${v.sbp}/${v.dbp}</td>
              <td style="font-weight:600;color:${v.hr>120?'var(--red)':v.hr>100?'var(--yellow)':'inherit'}">${v.hr}</td>
              <td style="font-weight:600;color:${v.rr>=25?'var(--red)':v.rr>=20?'var(--yellow)':'inherit'}">${v.rr}</td>
              <td style="font-weight:600;color:${v.spo2<90?'var(--red)':v.spo2<94?'var(--yellow)':'inherit'}">${v.spo2}%</td>
              <td style="font-weight:600;color:${v.urine<500?'var(--red)':v.urine<800?'var(--yellow)':'inherit'}">${v.urine}</td>
              <td><span class="badge badge-blue">${p.resp}</span></td>
              <td style="font-weight:600;color:${p.gcs<10?'var(--red)':p.gcs<14?'var(--yellow)':'inherit'}">${p.gcs}/15</td>
              <td><button class="btn btn-sm btn-primary" onclick="showAddVitalsModal('${p.id}')">Обновить</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>
  <div class="alert alert-blue">💡 Для внесения ежедневных витальных показателей нажмите "Обновить" в строке пациента</div>`;
}

// ══════════════════════════════════════════════════════════════
// PAGE: LABORATORY
// ══════════════════════════════════════════════════════════════
function laboratory() {
  const pts = DB.get('patients');
  return `
  <div class="tabs">
    <div class="tab active" onclick="labTab('oac',this)">ОАК</div>
    <div class="tab" onclick="labTab('bioch',this)">Биохимия</div>
    <div class="tab" onclick="labTab('coag',this)">Коагулограмма</div>
    <div class="tab" onclick="labTab('infl',this)">Воспаление</div>
  </div>
  <div id="labContent">${renderLabTab('oac', pts)}</div>`;
}

function labTab(type, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const pts = DB.get('patients');
  document.getElementById('labContent').innerHTML = renderLabTab(type, pts);
}

function renderLabTab(type, pts) {
  const cols = {
    oac: [['Hb','г/л',l=>l.hb,v=>v<70?'red':v<80?'yellow':''],['Лейкоциты','×10⁹',l=>l.wbc,v=>v<1?'red':v<2?'yellow':''],['Нейтрофилы','×10⁹',l=>l.neutro,v=>v<0.1?'red':v<0.5?'yellow':''],['Тромбоциты','×10⁹',l=>l.plt,v=>v<10?'red':v<30?'yellow':'']],
    bioch: [['Креатинин','мкмоль/л',l=>l.creat,v=>v>300?'red':v>170?'yellow':''],['Мочевина','ммоль/л',l=>l.urea,v=>v>20?'red':v>15?'yellow':''],['АЛТ','Ед/л',l=>l.alt,v=>v>100?'red':v>50?'yellow':''],['АСТ','Ед/л',l=>l.ast,v=>v>100?'red':v>50?'yellow':''],['Билирубин','мкмоль/л',l=>l.bili,v=>v>100?'red':v>33?'yellow':''],['Альбумин','г/л',l=>l.alb,v=>v<25?'red':v<30?'yellow':'']],
    coag: [['МНО','',l=>l.mno,v=>v>2?'red':v>1.5?'yellow':''],['АЧТВ','сек',l=>l.aptt,v=>v>80?'red':v>60?'yellow':''],['Фибриноген','г/л',l=>l.fibr,v=>v<1?'red':v<1.5?'yellow':''],['D-димер','мкг/мл',l=>l.ddimer,v=>v>5?'red':v>1?'yellow':'']],
    infl: [['CRP','мг/л',l=>l.crp,v=>v>150?'red':v>80?'yellow':''],['ПКТ','нг/мл',l=>l.pct,v=>v>10?'red':v>2?'yellow':''],['Ферритин','мкг/л',l=>l.ferr,v=>v>10000?'red':v>3000?'yellow':''],['Лактат','ммоль/л',l=>l.lactate,v=>v>4?'red':v>2?'yellow':'']]
  };
  const fields = cols[type] || [];
  return `<div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Пациент</th><th>Диагноз</th>${fields.map(f=>`<th>${f[0]} ${f[1]}</th>`).join('')}<th>Действия</th></tr></thead>
    <tbody>${pts.map(p => {
      const l = p.labs || {};
      return `<tr>
        <td><strong>${p.name.split(' ').slice(0,2).join(' ')}</strong><br><span style="font-size:11px;color:var(--gray-500)">${p.ward}</span></td>
        <td><span class="badge badge-blue">${p.diagnosis}</span></td>
        ${fields.map(([name,unit,get,color]) => {
          const val = get(l);
          const cl = color(val);
          return `<td style="font-weight:600;color:${cl==='red'?'var(--red)':cl==='yellow'?'var(--yellow)':'inherit'}">${val ?? '—'}</td>`;
        }).join('')}
        <td><button class="btn btn-sm btn-secondary" onclick="showLabModal('${p.id}')">Внести</button></td>
      </tr>`;
    }).join('')}</tbody>
  </table></div></div>`;
}

// ══════════════════════════════════════════════════════════════
// PAGE: SCORES
// ══════════════════════════════════════════════════════════════
function scores() {
  const pts = DB.get('patients');
  return `
  <div class="card">
    <div class="card-header"><div class="card-title">📊 Расчет шкал риска — все пациенты</div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Пациент</th><th>Диагноз</th><th>NEWS2</th><th>SOFA</th><th>qSOFA</th><th>MASCC</th><th>Зона</th></tr></thead>
        <tbody>
          ${pts.map(p => {
            const news = calcNEWS2(p.vitals, p.labs);
            const sofa = calcSOFA(p.vitals, p.labs);
            const qsofa = calcqSOFA(p.vitals);
            const mascc = calcMASCC(p);
            const zone = getZone(p);
            const scoreCell = (val, [c]) => `<td style="font-weight:700;color:${c==='high'?'var(--red)':c==='medium'?'var(--yellow)':'var(--green)'}">${val}</td>`;
            return `<tr>
              <td><strong>${p.name.split(' ').slice(0,2).join(' ')}</strong></td>
              <td><span class="badge badge-blue">${p.diagnosis}</span></td>
              ${scoreCell(news, newsLevel(news))}
              ${scoreCell(sofa, sofaLevel(sofa))}
              ${scoreCell(qsofa, qsofaLevel(qsofa))}
              <td style="font-weight:600;color:${mascc<21?'var(--red)':'var(--green)'}">${mascc}</td>
              <td>${zoneBadge(zone)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>
  <div class="grid grid-2" style="margin-top:16px">
    ${scoreInfo('NEWS2','Шкала раннего оповещения','≥7 — высокий риск, немедленное вмешательство<br>5-6 — срочная оценка<br>1-4 — мониторинг каждые 4-6 ч','blue')}
    ${scoreInfo('SOFA','Оценка органной дисфункции','≥11 — летальность >90%<br>6-10 — высокий риск<br>2-5 — умеренный риск','red')}
    ${scoreInfo('qSOFA','Быстрая оценка сепсиса','≥2 — сепсис вероятен, начать обследование<br>ЧДД≥22, САД≤100, GCS<15','yellow')}
    ${scoreInfo('MASCC','Индекс риска ФН','<21 — высокий риск ФН, госпитализация<br>≥21 — низкий риск<br>Применимо при нейтропении','green')}
  </div>`;
}

function scoreInfo(name, desc, rules, color) {
  return `<div class="card">
    <div class="card-title" style="margin-bottom:8px"><span class="badge badge-${color==='red'?'red':color==='yellow'?'yellow':color==='blue'?'blue':'green'}">${name}</span> ${desc}</div>
    <p style="font-size:12px;color:var(--gray-600);line-height:1.6">${rules}</p>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// PAGE: COMPLICATIONS
// ══════════════════════════════════════════════════════════════
const allComplications = [
  'Фебрильная нейтропения','Сепсис','Септический шок','Инвазивный микоз',
  'ЦМВ-инфекция','Кровотечение','ДВС-синдром','Синдром лизиса опухоли',
  'Цитокиновый шторм','Гемофагоцитарный синдром','ТЭЛА','Тромбоз',
  'Полиорганная недостаточность','Почечная недостаточность','Кардиотоксичность'
];

function complications() {
  const pts = DB.get('patients');
  const selId = document.getElementById('compPatSel')?.value || pts[0]?.id;
  const p = pts.find(x => x.id === selId) || pts[0];

  return `
  <div class="filter-bar" style="margin-bottom:20px">
    <select id="compPatSel" onchange="renderPage()" style="min-width:250px">
      ${pts.map(x => `<option value="${x.id}" ${x.id===p?.id?'selected':''}>${x.name} (${x.diagnosis})</option>`).join('')}
    </select>
    ${p ? zoneBadge(getZone(p)) : ''}
  </div>

  ${p ? `
  <div class="grid grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">☑ Чек-лист осложнений</div>
        <button class="btn btn-sm btn-primary" onclick="saveComplications('${p.id}')">Сохранить</button>
      </div>
      <ul class="checklist" id="compList">
        ${allComplications.map(c => {
          const checked = p.complications?.includes(c);
          return `<li class="checklist-item ${checked?'checked':''}" onclick="toggleComp(this)">
            <input type="checkbox" ${checked?'checked':''} onclick="event.stopPropagation();this.parentElement.classList.toggle('checked')">
            <span class="checklist-label">${c}</span>
            ${c==='Септический шок'?'<span class="badge badge-red checklist-badge">Критично</span>':''}
            ${c==='Полиорганная недостаточность'?'<span class="badge badge-red checklist-badge">Критично</span>':''}
          </li>`;
        }).join('')}
      </ul>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Активные осложнения</div></div>
      ${p.complications?.length
        ? p.complications.map(c => `
          <div class="alert alert-red">
            <strong>🔴 ${c}</strong>
            <div style="font-size:11px;margin-top:4px">${compAdvice(c)}</div>
          </div>`).join('')
        : '<div class="alert alert-green">✅ Активных осложнений не выявлено</div>'}
      <div class="divider"></div>
      <div style="font-size:12px;color:var(--gray-500);font-weight:600;margin-bottom:8px">СТАТИСТИКА ОТДЕЛЕНИЯ</div>
      ${allComplications.slice(0,6).map(c => {
        const count = pts.filter(x => x.complications?.includes(c)).length;
        const pct = pts.length ? Math.round(count/pts.length*100) : 0;
        return `<div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
            <span>${c}</span><span style="font-weight:600">${count}/${pts.length}</span>
          </div>
          <div class="progress"><div class="progress-bar ${pct>50?'red':pct>25?'yellow':'green'}" style="width:${pct}%"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>` : '<p>Выберите пациента</p>'}`;
}

function compAdvice(c) {
  const map = {
    'Септический шок': 'Флюидная терапия 30 мл/кг, вазопрессоры, антибиотики в течение 1 часа',
    'ДВС-синдром': 'СЗП, криопреципитат, ТК при кровотечении, мониторинг коагулограммы',
    'Инвазивный микоз': 'Каспофунгин или вориконазол, КТ ОГК, консультация инфекциониста',
    'Кровотечение': 'Трансфузия ТК при <20, СЗП при МНО>2, хирург при необходимости',
    'Полиорганная недостаточность': 'ОРИТ, ИВЛ при необходимости, ЗПТ при ОПП, мониторинг SOFA',
    'Синдром лизиса опухоли': 'Гипергидратация 3 л/м²/сут, аллопуринол или расбуриказа, ЭКГ'
  };
  return map[c] || 'Специализированное наблюдение и лечение';
}

function toggleComp(el) { el.classList.toggle('checked'); el.querySelector('input').checked = el.classList.contains('checked'); }

function saveComplications(id) {
  const pts = DB.get('patients');
  const p = pts.find(x => x.id === id);
  if (!p) return;
  const checked = [...document.querySelectorAll('#compList .checklist-item.checked .checklist-label')].map(el => el.textContent);
  p.complications = checked;
  DB.set('patients', pts);
  showToast('Осложнения сохранены', 'success');
}

// ══════════════════════════════════════════════════════════════
// PAGE: THERAPY
// ══════════════════════════════════════════════════════════════
function therapy() {
  const pts = DB.get('patients');
  const types = { 'АБ': 'Антибиотики', 'ПГ': 'Противогрибковые', 'ПВ': 'Противовирусные', 'ТКИ': 'ТКИ', 'ХТ': 'Химиотерапия', 'ИТ': 'Иммунотерапия', 'ГКС': 'Глюкокортикоиды', 'АКГ': 'Антикоагулянты' };

  return `
  <div class="card" style="margin-bottom:16px">
    <div class="card-header"><div class="card-title">⚠️ Требуют пересмотра (≥7 дней)</div></div>
    ${pts.flatMap(p => (p.therapy||[]).filter(t=>daysSince(t.start)>=7).map(t =>
      `<div class="notification-bar">
        <span class="icon">⚠️</span>
        <div><strong>${p.name.split(' ').slice(0,2).join(' ')}</strong> — ${t.name} ${t.dose}<br>
        <span style="font-size:12px;color:#92400e">Терапия ${daysSince(t.start)} дней (начата ${fmtDate(t.start)})</span></div>
        <button class="btn btn-sm btn-warning" style="margin-left:auto" onclick="navigate('patients','${p.id}')">Пациент</button>
      </div>`
    )).join('') || '<div class="alert alert-green">Все препараты назначены менее 7 дней назад</div>'}
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">💊 Вся активная терапия</div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Пациент</th><th>Препарат</th><th>Тип</th><th>Доза</th><th>Начало</th><th>Дни</th><th>Статус</th></tr></thead>
        <tbody>
          ${pts.flatMap(p => (p.therapy||[]).map(t => {
            const days = daysSince(t.start);
            return `<tr>
              <td><strong>${p.name.split(' ').slice(0,2).join(' ')}</strong><br><span style="font-size:11px;color:var(--gray-500)">${p.diagnosis}</span></td>
              <td style="font-weight:600">${t.name}</td>
              <td><span class="badge badge-blue">${t.type}</span></td>
              <td>${t.dose}</td>
              <td>${fmtDate(t.start)}</td>
              <td style="font-weight:600;color:${days>=7?'var(--red)':days>=5?'var(--yellow)':'inherit'}">${days}</td>
              <td>${days>=7?'<span class="badge badge-red">Пересмотр!</span>':'<span class="badge badge-green">Активна</span>'}</td>
            </tr>`;
          })).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// PAGE: TRANSFUSION
// ══════════════════════════════════════════════════════════════
function transfusion() {
  const pts = DB.get('patients');
  const all = pts.flatMap(p => (p.transfusions||[]).map(t => ({...t, patient: p})));
  const typeCount = { ЭМ:0, ТК:0, СЗП:0, КП:0 };
  all.forEach(t => { typeCount[t.type] = (typeCount[t.type]||0)+1; });
  const reactions = all.filter(t => t.reaction).length;

  return `
  <div class="grid grid-4" style="margin-bottom:16px">
    <div class="stat-card red"><div class="stat-label">Эритромасса</div><div class="stat-value">${typeCount.ЭМ}</div><div class="stat-sub">трансфузий</div></div>
    <div class="stat-card yellow"><div class="stat-label">Тромбоконцентрат</div><div class="stat-value">${typeCount.ТК}</div><div class="stat-sub">трансфузий</div></div>
    <div class="stat-card blue"><div class="stat-label">СЗП</div><div class="stat-value">${typeCount.СЗП||0}</div><div class="stat-sub">трансфузий</div></div>
    <div class="stat-card ${reactions>0?'red':'green'}"><div class="stat-label">Реакции</div><div class="stat-value">${reactions}</div><div class="stat-sub">из ${all.length} трансфузий</div></div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">🩸 Журнал трансфузий</div><button class="btn btn-sm btn-primary" onclick="showTransfusionModal()">+ Внести</button></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Пациент</th><th>Дата</th><th>Компонент</th><th>Объём</th><th>Реакция</th></tr></thead>
        <tbody>
          ${all.sort((a,b) => new Date(b.date)-new Date(a.date)).map(t => `<tr>
            <td><strong>${t.patient.name.split(' ').slice(0,2).join(' ')}</strong><br><span style="font-size:11px;color:var(--gray-500)">${t.patient.diagnosis}</span></td>
            <td>${fmtDate(t.date)}</td>
            <td><span class="badge badge-${t.type==='ЭМ'?'red':t.type==='ТК'?'yellow':'blue'}">${t.type}</span></td>
            <td>${t.vol} мл</td>
            <td>${t.reaction?'<span class="badge badge-red">⚠ Реакция</span>':'<span class="badge badge-green">Без реакций</span>'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="card-header"><div class="card-title">📋 Показания к трансфузии</div></div>
    <div class="grid grid-3">
      ${transfIndication('🔴 ЭМ','Гемоглобин < 70 г/л (или < 80 г/л при симптомах)','Цель: Hb > 70 г/л (80–90 при ИБС)')}
      ${transfIndication('🟡 ТК','Тромбоциты < 10×10⁹/л (профил.) или < 20 при процедуре','Цель: Тр > 10 (>20 при ФН, >50 при операции)')}
      ${transfIndication('🟠 СЗП','МНО > 2 при кровотечении или инвазивных процедурах','15–20 мл/кг, коррекция коагулопатии')}
    </div>
  </div>`;
}

function transfIndication(title, indication, goal) {
  return `<div style="background:var(--gray-50);border-radius:8px;padding:14px;border:1px solid var(--gray-200)">
    <div style="font-weight:700;font-size:13px;margin-bottom:8px">${title}</div>
    <div style="font-size:12px;color:var(--gray-600);margin-bottom:6px"><strong>Показание:</strong> ${indication}</div>
    <div style="font-size:12px;color:var(--gray-600)"><strong>Цель:</strong> ${goal}</div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// PAGE: CONSILIUM РВК при РЦК
// ══════════════════════════════════════════════════════════════

/* Препараты групп 46/47/48 требующие согласования */
const DRUGS_G46 = ['Даратумумаб','Брентуксимаб ведотин','Акалабрутиниб','Помалидомид','Иксазомиб','Пембролизумаб','Ниволумаб','Ибрутиниб','Венетоклакс (гр.46)','Полатузумаб ведотин'];
const DRUGS_G47 = ['Блинотумомаб','Понатиниб (гр.47)','Венетоклакс (гр.47)','Мидостаурин','Экулизумаб'];
const DRUGS_G48 = ['Понатиниб (гр.48)'];

/* Чек-лист документов (ШАГ 3) */
const DOCS_CHECKLIST = [
  { id: 'd1', label: 'Паспортные данные пациента' },
  { id: 'd2', label: 'Выписка с диагнозом' },
  { id: 'd3', label: 'Протокол внутрибольничного консилиума (ШАГ 2)' },
  { id: 'd4', label: 'Морфология / ИГХ / иммунохимия' },
  { id: 'd5', label: 'Цитогенетика / FISH / ПЦР / NGS' },
  { id: 'd6', label: 'Данные визуализации (КТ / МРТ / ПЭТ-КТ / УЗИ)' },
  { id: 'd7', label: 'Лабораторные данные (ОАК, биохимия)' },
  { id: 'd8', label: 'Сопутствующие заболевания, оценка риска' },
  { id: 'd9', label: 'Цель направления на согласование' },
];

/* Рабочие дни заседаний РВК: пн, ср, пт */
function nextConsiliumDate(fromDate) {
  const d = new Date(fromDate || Date.now());
  const weekday = d.getDay(); // 0=вс,1=пн,...6=сб
  const sessionDays = [1, 3, 5]; // пн, ср, пт
  for (let i = 1; i <= 7; i++) {
    const next = new Date(d); next.setDate(d.getDate() + i);
    if (sessionDays.includes(next.getDay())) return next;
  }
  return d;
}

function workingDaysLeft(sentDate, decisionDeadline) {
  let count = 0; const d = new Date(sentDate);
  while (d < new Date(decisionDeadline)) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) count++;
  }
  return count;
}

function addWorkingDays(dateStr, days) {
  const d = new Date(dateStr); let added = 0;
  while (added < days) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) added++; }
  return d.toISOString().split('T')[0];
}

function consiliumStatusBadge(status) {
  const map = {
    draft:     '<span class="badge badge-gray">📝 Черновик</span>',
    step1:     '<span class="badge badge-blue">🔬 ШАГ 1: Верификация</span>',
    step2:     '<span class="badge badge-blue">🏥 ШАГ 2: Внутрибольничный</span>',
    step3:     '<span class="badge badge-yellow">📋 ШАГ 3: Пакет документов</span>',
    step4:     '<span class="badge badge-yellow">📤 ШАГ 4: Отправлено в РЦК</span>',
    step5:     '<span class="badge badge-yellow">⏳ ШАГ 5: Ожидание решения</span>',
    approved:  '<span class="badge badge-green">✅ Согласовано</span>',
    rejected:  '<span class="badge badge-red">❌ Отказано</span>',
    step7:     '<span class="badge badge-green">💊 ШАГ 7: Лечение начато</span>',
  };
  return map[status] || '<span class="badge badge-gray">—</span>';
}

function consilium() {
  const cases = DB.get('consiliums');
  const pts = DB.get('patients');

  // Уведомления: просроченные и приближающиеся дедлайны
  const alerts = cases.filter(c => c.status === 'step5').map(c => {
    const deadline = new Date(c.deadline);
    const today = new Date(); today.setHours(0,0,0,0);
    const diffDays = Math.ceil((deadline - today) / 86400000);
    if (diffDays < 0) return `<div class="notification-bar" style="border-color:var(--red)">
      <span style="color:var(--red);font-size:18px">🚨</span>
      <div><strong>ПРОСРОЧЕНО!</strong> ${c.patientName} — решение РВК должно было поступить ${fmtDate(c.deadline)}</div>
      <button class="btn btn-sm btn-primary" onclick="openConsiliumDetail('${c.id}')">Открыть</button></div>`;
    if (diffDays <= 1) return `<div class="notification-bar" style="border-color:var(--yellow);background:var(--yellow-light)">
      <span style="font-size:18px">⚠️</span>
      <div><strong>Дедлайн завтра!</strong> ${c.patientName} — решение до ${fmtDate(c.deadline)}</div>
      <button class="btn btn-sm btn-warning" onclick="openConsiliumDetail('${c.id}')">Открыть</button></div>`;
    return '';
  }).join('');

  const stepCounts = { draft:0, step1:0, step2:0, step3:0, step4:0, step5:0, approved:0, rejected:0, step7:0 };
  cases.forEach(c => { stepCounts[c.status] = (stepCounts[c.status]||0)+1; });

  return `
  ${alerts}

  <div class="grid grid-4" style="margin-bottom:16px">
    <div class="stat-card blue"><div class="stat-label">Всего заявок</div><div class="stat-value">${cases.length}</div></div>
    <div class="stat-card yellow"><div class="stat-label">Ожидают решения</div><div class="stat-value">${stepCounts.step5||0}</div><div class="stat-sub">РВК заседает пн/ср/пт</div></div>
    <div class="stat-card green"><div class="stat-label">Согласовано</div><div class="stat-value">${stepCounts.approved||0}</div></div>
    <div class="stat-card red"><div class="stat-label">Отказано</div><div class="stat-value">${stepCounts.rejected||0}</div></div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="card-header">
      <div class="card-title">⚖️ Журнал заявок РВК при РЦК</div>
      <button class="btn btn-primary" onclick="showNewConsiliumModal()">+ Новая заявка</button>
    </div>
    ${cases.length === 0 ? `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      <h3>Заявок нет</h3><p>Нажмите «+ Новая заявка» для создания</p>
    </div>` : `
    <div class="table-wrap"><table>
      <thead><tr><th>№</th><th>Пациент</th><th>Диагноз</th><th>Препарат</th><th>Цель</th><th>Отправлено</th><th>Дедлайн</th><th>Статус</th><th>Действия</th></tr></thead>
      <tbody>
        ${cases.map((c,i) => {
          const today = new Date(); today.setHours(0,0,0,0);
          const deadline = c.deadline ? new Date(c.deadline) : null;
          const overdue = deadline && c.status === 'step5' && deadline < today;
          return `<tr ${overdue ? 'style="background:var(--red-light)"' : ''}>
            <td style="font-weight:700;color:var(--gray-500)">${String(i+1).padStart(3,'0')}</td>
            <td><strong>${c.patientName}</strong><br><span style="font-size:11px;color:var(--gray-500)">${c.patientIIN}</span></td>
            <td><span class="badge badge-blue">${c.diagnosis}</span></td>
            <td style="font-size:12px;font-weight:600">${c.drug || '—'}</td>
            <td style="font-size:11px">${c.purpose || '—'}</td>
            <td style="font-size:12px">${c.sentDate ? fmtDate(c.sentDate) : '—'}</td>
            <td style="font-size:12px;font-weight:600;color:${overdue?'var(--red)':''}">${c.deadline ? fmtDate(c.deadline) : '—'}</td>
            <td>${consiliumStatusBadge(c.status)}</td>
            <td style="white-space:nowrap">
              <button class="btn btn-sm btn-secondary" onclick="openConsiliumDetail('${c.id}')">Открыть</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>`}
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">📋 Алгоритм РВК при РЦК — 7 шагов</div></div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${[
        ['1','ШАГ 1: Верификация диагноза','Полный диагностический пакет: морфология, ИГХ, цитогенетика, FISH, ПЦР/NGS, ОАК, биохимия, визуализация','blue'],
        ['2','ШАГ 2: Внутрибольничный консилиум','Диагноз, стадия/группа риска, показания, соответствие КП, план лечения, финансирование','blue'],
        ['3','ШАГ 3: Формирование пакета документов','9 обязательных документов согласно перечню Алгоритма','yellow'],
        ['4','ШАГ 4: Направление уведомления','Заполнить форму Приложения 1. Отправить на hema.nroc@gmail.com. Зафиксировать дату в журнале','yellow'],
        ['5','ШАГ 5: Ожидание решения (до 3 рабочих дней)','Заседания: понедельник, среда, пятница. Решение: согласовано или мотивированный отказ','yellow'],
        ['6','ШАГ 6: Документирование решения','Решение РВК подшивается в историю болезни. Фиксируется в МИС','green'],
        ['7','ШАГ 7: Назначение и начало лечения','Оформить назначение, контролировать обеспечение препаратом, оценивать токсичность по КП','green'],
      ].map(([n,title,desc,color]) => `
        <div style="display:flex;gap:12px;padding:10px 14px;border:1px solid var(--gray-200);border-radius:8px;align-items:flex-start">
          <div style="min-width:32px;height:32px;background:var(--${color==='green'?'green':color==='yellow'?'yellow':'blue'}-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:var(--${color==='green'?'green':color==='yellow'?'yellow':'blue'})">${n}</div>
          <div><div style="font-weight:600;font-size:13px">${title}</div><div style="font-size:12px;color:var(--gray-500);margin-top:2px">${desc}</div></div>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ── Детальная карточка консилиума ─────────────────────── */
function openConsiliumDetail(id) {
  const cases = DB.get('consiliums');
  const c = cases.find(x => x.id === id);
  if (!c) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const deadline = c.deadline ? new Date(c.deadline) : null;
  const diffDays = deadline ? Math.ceil((deadline - today) / 86400000) : null;

  const stepOrder = ['draft','step1','step2','step3','step4','step5','approved','rejected','step7'];
  const stepIdx = stepOrder.indexOf(c.status);

  const nextActions = {
    draft:    [['step1','▶ Начать верификацию диагноза','secondary']],
    step1:    [['step2','▶ Провести внутрибольничный консилиум','primary']],
    step2:    [['step3','▶ Сформировать пакет документов','primary']],
    step3:    [['step4','▶ Отправить уведомление в РЦК','primary']],
    step4:    [['step5','▶ Зафиксировать дату отправки','primary']],
    step5:    [['approved','✅ Получено: СОГЛАСОВАНО','success'],['rejected','❌ Получено: ОТКАЗАНО','warning']],
    approved: [['step7','▶ Оформить назначение препарата','primary']],
    rejected: [['step3','🔄 Повторная подача документов','secondary']],
    step7:    [],
  };

  openModal(`Заявка РВК — ${c.patientName}`, `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${consiliumStatusBadge(c.status)}
      <span class="badge badge-blue">${c.diagnosis}</span>
      ${c.drug ? `<span class="badge badge-purple" style="background:var(--purple-light);color:var(--purple)">${c.drug}</span>` : ''}
      ${deadline && c.status==='step5' ? `<span class="badge ${diffDays<0?'badge-red':diffDays<=1?'badge-yellow':'badge-blue'}">Дедлайн: ${fmtDate(c.deadline)} (${diffDays<0?'просрочено!':diffDays+' дн.'})</span>` : ''}
    </div>

    <!-- Прогресс шагов -->
    <div style="display:flex;gap:4px;margin-bottom:20px;overflow-x:auto;padding-bottom:4px">
      ${['Верификация','Внутрибольн.','Документы','Отправлено','Ожидание','Решение','Лечение'].map((label,i) => {
        const sIdx = i + 1; // step1..step7 или approved/rejected
        const past = stepIdx > i + 1 || c.status === 'approved' || c.status === 'step7' || c.status === 'rejected';
        const active = (stepIdx === i + 1) || (i === 5 && (c.status === 'approved' || c.status === 'rejected'));
        return `<div style="flex:1;min-width:60px;text-align:center">
          <div style="width:28px;height:28px;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:${past||active?(c.status==='rejected'&&i===5?'var(--red)':'var(--green)'):'var(--gray-200)'};color:${past||active?'#fff':'var(--gray-400)'}">
            ${past ? '✓' : i+1}
          </div>
          <div style="font-size:9px;color:${active?'var(--blue)':'var(--gray-400)'};font-weight:${active?700:400}">${label}</div>
        </div>`;
      }).join('<div style="flex:0 0 8px;display:flex;align-items:flex-start;padding-top:10px;color:var(--gray-300)">—</div>')}
    </div>

    <!-- Данные пациента -->
    <div style="background:var(--gray-50);border-radius:8px;padding:12px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--gray-500);margin-bottom:8px">ДАННЫЕ ПАЦИЕНТА</div>
      <div class="grid grid-2" style="gap:8px;font-size:13px">
        <div><span style="color:var(--gray-500)">ФИО: </span><strong>${c.patientName}</strong></div>
        <div><span style="color:var(--gray-500)">ИИН: </span><strong>${c.patientIIN}</strong></div>
        <div><span style="color:var(--gray-500)">Дата рождения: </span><strong>${c.dob || '—'}</strong></div>
        <div><span style="color:var(--gray-500)">Диагноз: </span><strong>${c.diagnosis}</strong></div>
        <div><span style="color:var(--gray-500)">Шифр МКБ-10: </span><strong>${c.icd10 || '—'}</strong></div>
        <div><span style="color:var(--gray-500)">Цель: </span><strong>${c.purpose || '—'}</strong></div>
      </div>
    </div>

    <!-- Препарат -->
    ${c.drug ? `<div style="background:var(--purple-light);border-radius:8px;padding:12px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--purple);margin-bottom:6px">ПЛАНИРУЕМЫЙ ПРЕПАРАТ</div>
      <div style="font-size:14px;font-weight:700;color:var(--purple)">${c.drug} — ${c.drugGroup || ''}</div>
      ${c.drugJustification ? `<div style="font-size:12px;color:var(--gray-600);margin-top:6px">${c.drugJustification}</div>` : ''}
    </div>` : ''}

    <!-- Чек-лист документов -->
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--gray-500);margin-bottom:8px">ЧЕК-ЛИСТ ДОКУМЕНТОВ (ШАГ 3)</div>
      ${DOCS_CHECKLIST.map(doc => {
        const checked = c.docs && c.docs.includes(doc.id);
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100)">
          <span style="font-size:16px">${checked ? '✅' : '⬜'}</span>
          <span style="font-size:12px;${checked?'':'color:var(--gray-500)'}">${doc.label}</span>
        </div>`;
      }).join('')}
      <div style="margin-top:8px;font-size:12px;font-weight:600;color:${c.docs&&c.docs.length===9?'var(--green)':'var(--yellow)'}">
        Готово: ${c.docs ? c.docs.length : 0} / ${DOCS_CHECKLIST.length}
      </div>
    </div>

    <!-- Решение и примечания -->
    ${c.decision ? `<div class="alert ${c.status==='approved'?'alert-green':'alert-red'}">
      <strong>${c.status==='approved'?'✅ Решение: СОГЛАСОВАНО':'❌ Решение: ОТКАЗАНО'}</strong>
      ${c.decisionDate ? `<span style="margin-left:8px;font-size:11px">${fmtDate(c.decisionDate)}</span>` : ''}
      ${c.decisionNote ? `<div style="margin-top:6px;font-size:12px">${c.decisionNote}</div>` : ''}
    </div>` : ''}

    <!-- Следующие действия -->
    ${(nextActions[c.status] || []).length ? `
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--gray-500);margin-bottom:8px">СЛЕДУЮЩИЙ ШАГ</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${(nextActions[c.status]||[]).map(([toStatus,label,type]) =>
          `<button class="btn btn-${type}" onclick="updateConsiliumStatus('${id}','${toStatus}')">${label}</button>`
        ).join('')}
      </div>
    </div>` : ''}

    <div class="modal-footer" style="padding:12px 0 0;border-top:1px solid var(--gray-200);margin-top:8px">
      <button class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
      <button class="btn btn-secondary" onclick="showDecisionModal('${id}')">📝 Внести решение</button>
      <button class="btn btn-primary" onclick="printNotification('${id}')">🖨 Уведомление (Прил.1)</button>
    </div>`);
}

/* ── Обновление статуса консилиума ──────────────────────── */
function updateConsiliumStatus(id, newStatus) {
  const cases = DB.get('consiliums');
  const c = cases.find(x => x.id === id);
  if (!c) return;
  c.status = newStatus;
  if (newStatus === 'step4' || newStatus === 'step5') {
    c.sentDate = today();
    c.deadline = addWorkingDays(today(), 3);
  }
  if (newStatus === 'approved') { c.decisionDate = today(); }
  if (newStatus === 'rejected') { c.decisionDate = today(); }
  DB.set('consiliums', cases);
  closeModal();
  showToast('Статус обновлён', 'success');
  renderPage();
}

/* ── Внести решение РВК ─────────────────────────────────── */
function showDecisionModal(id) {
  closeModal();
  setTimeout(() => {
    openModal('Решение РВК при РЦК', `
      <div class="form-group"><label>Решение</label>
        <select id="dStatus">
          <option value="approved">✅ Согласовано</option>
          <option value="rejected">❌ Отказано</option>
        </select>
      </div>
      <div class="form-group"><label>Дата решения</label>
        <input id="dDate" type="date" value="${today()}">
      </div>
      <div class="form-group"><label>Обоснование / Причина отказа</label>
        <textarea id="dNote" rows="4" placeholder="При отказе: недостаточно данных / не соответствует КП / ошибочная линия терапии / требуется дообследование"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" onclick="saveDecision('${id}')">Сохранить</button>
      </div>`);
  }, 200);
}

function saveDecision(id) {
  const cases = DB.get('consiliums');
  const c = cases.find(x => x.id === id);
  if (!c) return;
  c.status = document.getElementById('dStatus').value;
  c.decisionDate = document.getElementById('dDate').value;
  c.decisionNote = document.getElementById('dNote').value;
  c.decision = true;
  DB.set('consiliums', cases);
  closeModal();
  showToast(c.status === 'approved' ? '✅ Согласовано!' : '❌ Отказ зафиксирован', c.status === 'approved' ? 'success' : 'error');
  renderPage();
}

/* ── Печать уведомления Приложение 1 ───────────────────── */
function printNotification(id) {
  const cases = DB.get('consiliums');
  const c = cases.find(x => x.id === id);
  if (!c) return;
  const num = String(DB.get('consiliums').indexOf(c) + 1).padStart(3, '0');
  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Уведомление РВК — ${c.patientName}</title>
  <style>
    body{font-family:'Times New Roman',serif;font-size:14px;margin:40px;color:#000;line-height:1.6}
    h2{text-align:center;font-size:16px;font-weight:bold;margin:24px 0 8px}
    h3{text-align:center;font-size:13px;font-weight:normal;margin:0 0 24px}
    .header-right{text-align:right;font-size:13px;margin-bottom:24px}
    .section{margin-bottom:16px}
    .section-title{font-weight:bold;margin-bottom:6px}
    .field{margin-bottom:6px}
    .field-label{font-weight:bold}
    .underline{border-bottom:1px solid #000;min-width:200px;display:inline-block}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    td,th{border:1px solid #000;padding:6px 8px;font-size:13px}
    .sign-block{display:flex;justify-content:space-between;margin-top:32px}
    .sign-line{border-top:1px solid #000;width:200px;text-align:center;font-size:12px;padding-top:4px}
    ul{margin:4px 0;padding-left:20px}
    li{margin-bottom:2px}
    @media print{button{display:none!important}}
  </style></head><body>
  <div style="text-align:right;font-size:12px">Исходящий №${num} от «${new Date().getDate()}» ${['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][new Date().getMonth()]} ${new Date().getFullYear()} г.</div>
  <h2>УВЕДОМЛЕНИЕ</h2>
  <h3>о направлении материалов на врачебный консилиум Республиканского центра компетенции,<br>
  для согласования назначения лекарственных средств, подлежащих обязательному согласованию /<br>
  подбора режима индукций и консолидаций / проведение ТГСК</h3>

  <div class="section">
    <div class="section-title">1. Данные пациента</div>
    <div class="field">• ФИО: <span class="underline">${c.patientName}</span></div>
    <div class="field">• Дата рождения: <span class="underline">${c.dob || '_______________'}</span></div>
    <div class="field">• ИИН: <span class="underline">${c.patientIIN}</span></div>
    <div class="field">• Адрес: <span class="underline">${c.address || '_________________________________'}</span></div>
  </div>

  <div class="section">
    <div class="section-title">2. Диагноз и обоснование</div>
    <div class="field">• Предварительный/окончательный диагноз: <span class="underline">${c.diagnosis}</span></div>
    <div class="field">• Шифр по МКБ-10: <span class="underline">${c.icd10 || '___________'}</span></div>
    <div class="field">• Дата установления диагноза: <span class="underline">${c.diagDate || '_______________'}</span></div>
    <div class="field">• Основание: морфология / иммунохимия / ИГХ / цитогенетика / FISH / ПЦР / NGS</div>
    <div class="field">• Проведённое лечение: <span class="underline">${c.priorTreatment || '________________________________'}</span></div>
    <div class="field">• Эффект на проводимую терапию: <span class="underline">${c.response || '________________________________'}</span></div>
    <div class="field">• Краткая клиническая характеристика: <span class="underline">${c.clinicalStatus || '________________________________'}</span></div>
  </div>

  <div class="section">
    <div class="section-title">3. Планируемый препарат для согласования</div>
    <div class="field">• Препарат: <strong>${c.drug || '___________________'}</strong> (${c.drugGroup || '___'})</div>
  </div>

  <div class="section">
    <div class="section-title">4. Обоснование выбора препарата согласно КП</div>
    <div class="field">${c.drugJustification || '_____________________________________________'}</div>
  </div>

  <div class="section">
    <div class="section-title">5. Перечень прилагаемых документов</div>
    <ul>
      ${DOCS_CHECKLIST.map((d,i) => `<li>${i+1}. ${d.label} ${c.docs&&c.docs.includes(d.id)?'✓':''}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <div class="field">• Направляется на режим индукций и консолидаций: <strong>${c.purpose==='Режим индукции/консолидации'?'Да':'—'}</strong></div>
    <div class="field">• Направляется на проведение ТГСК: <strong>${c.purpose==='Направление на ТГСК'?'Да':'—'}</strong></div>
    <div class="field" style="margin-top:10px">Медицинская организация подтверждает достоверность и полноту предоставленных данных: <strong>Да ☑ &nbsp;&nbsp; Нет ☐</strong></div>
    <div class="field">Возможность назначения данного лекарственного средства с учётом финансирования: <strong>Да ☑ &nbsp;&nbsp; Нет ☐</strong></div>
  </div>

  <div class="sign-block">
    <div>
      <div>Руководитель организации-заявителя</div>
      <div style="margin-top:24px">ФИО _________________________ Подпись ____________ М.П.</div>
    </div>
    <div>
      <div>Лечащий врач / врач-гематолог</div>
      <div style="margin-top:24px">ФИО _________________________ Подпись ____________</div>
    </div>
  </div>

  <div style="text-align:center;margin-top:32px;font-size:12px;color:#666;border-top:1px solid #ccc;padding-top:8px">
    Документы направляются на: hema.nroc@gmail.com | РВК при РЦК — заседания: понедельник, среда, пятница | Срок решения: 3 рабочих дня
  </div>

  <div style="text-align:center;margin-top:16px">
    <button onclick="window.print()" style="padding:10px 24px;background:#dc2626;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer">🖨 Распечатать</button>
    <button onclick="window.close()" style="padding:10px 24px;background:#6b7280;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;margin-left:8px">Закрыть</button>
  </div>
  </body></html>`);
  win.document.close();
}

/* ── Новая заявка РВК ───────────────────────────────────── */
function showNewConsiliumModal() {
  const pts = DB.get('patients');
  openModal('Новая заявка РВК при РЦК', `
    <div class="form-section">
      <div class="form-section-title">ПАЦИЕНТ</div>
      <div class="form-group"><label>Выбрать из реестра (автозаполнение)</label>
        <select id="cPatSel" onchange="autoFillConsilium()">
          <option value="">— Выбрать пациента —</option>
          ${pts.map(p => `<option value="${p.id}">${p.name} (${p.diagnosis}, ИИН: ${p.iin})</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>ФИО пациента *</label><input id="cName" placeholder="Фамилия Имя Отчество"></div>
        <div class="form-group"><label>ИИН *</label><input id="cIIN" placeholder="12 цифр"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Дата рождения</label><input id="cDob" type="date"></div>
        <div class="form-group"><label>Адрес</label><input id="cAddr" placeholder="Город, область"></div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">ДИАГНОЗ</div>
      <div class="form-row">
        <div class="form-group"><label>Основной диагноз *</label>
          <select id="cDx">${['ОМЛ','ОЛЛ','МДС','ММ','Лимфомы','ХМЛ','ПНГ','АА','Другое'].map(d=>`<option>${d}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Шифр МКБ-10</label><input id="cIcd" placeholder="C91.0"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Дата установления диагноза</label><input id="cDiagDate" type="date"></div>
        <div class="form-group"><label>Цель направления *</label>
          <select id="cPurpose">
            <option>Первичное назначение высокозатратных ЛС</option>
            <option>Режим индукции/консолидации</option>
            <option>Направление на ТГСК</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label>Проведённое лечение (курсы, дозы, даты)</label>
        <textarea id="cPriorTx" rows="2" placeholder="Например: R-CHOP ×6 (01.2025–06.2025), доза..."></textarea>
      </div>
      <div class="form-group"><label>Эффект на терапию (ответ согласно КП)</label>
        <textarea id="cResponse" rows="2" placeholder="ПР / ЧР / Прогрессия / Рецидив..."></textarea>
      </div>
      <div class="form-group"><label>Краткий клинический статус</label>
        <textarea id="cClinStatus" rows="2" placeholder="ECOG, осложнения, сопутствующие заболевания..."></textarea>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">ПЛАНИРУЕМЫЙ ПРЕПАРАТ (Группы 46/47/48)</div>
      <div class="form-row">
        <div class="form-group"><label>Группа</label>
          <select id="cDrugGrp" onchange="updateDrugList()">
            <option value="46">Группа 46</option>
            <option value="47">Группа 47</option>
            <option value="48">Группа 48</option>
          </select>
        </div>
        <div class="form-group"><label>Препарат *</label>
          <select id="cDrug">${DRUGS_G46.map(d=>`<option>${d}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-group"><label>Обоснование выбора согласно КП (линия терапии, показания, маркеры)</label>
        <textarea id="cDrugJust" rows="3" placeholder="Например: Рецидив ОМЛ с FLT3 мутацией. Мидостаурин показан в 1-й линии согласно КП МЗ РК 2023, стр. 12..."></textarea>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">ЧЕК-ЛИСТ ДОКУМЕНТОВ (ШАГ 3)</div>
      <div style="display:flex;flex-direction:column;gap:4px" id="cDocsChecklist">
        ${DOCS_CHECKLIST.map(doc => `
          <label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--gray-200);border-radius:6px;cursor:pointer">
            <input type="checkbox" value="${doc.id}" style="width:16px;height:16px;accent-color:var(--green)">
            <span style="font-size:13px">${doc.label}</span>
          </label>`).join('')}
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveNewConsilium()">Создать заявку</button>
    </div>`);
}

function autoFillConsilium() {
  const id = document.getElementById('cPatSel').value;
  if (!id) return;
  const p = DB.get('patients').find(x => x.id === id);
  if (!p) return;
  document.getElementById('cName').value = p.name;
  document.getElementById('cIIN').value = p.iin;
  document.getElementById('cDx').value = p.diagnosis;
}

function updateDrugList() {
  const grp = document.getElementById('cDrugGrp').value;
  const drugs = grp === '46' ? DRUGS_G46 : grp === '47' ? DRUGS_G47 : DRUGS_G48;
  document.getElementById('cDrug').innerHTML = drugs.map(d => `<option>${d}</option>`).join('');
}

function saveNewConsilium() {
  const name = document.getElementById('cName').value.trim();
  const iin = document.getElementById('cIIN').value.trim();
  if (!name || !iin) { showToast('Заполните ФИО и ИИН', 'error'); return; }
  const docs = [...document.querySelectorAll('#cDocsChecklist input:checked')].map(el => el.value);
  const cases = DB.get('consiliums');
  cases.push({
    id: DB.genId(),
    patientName: name,
    patientIIN: iin,
    dob: document.getElementById('cDob').value,
    address: document.getElementById('cAddr').value,
    diagnosis: document.getElementById('cDx').value,
    icd10: document.getElementById('cIcd').value,
    diagDate: document.getElementById('cDiagDate').value,
    purpose: document.getElementById('cPurpose').value,
    priorTreatment: document.getElementById('cPriorTx').value,
    response: document.getElementById('cResponse').value,
    clinicalStatus: document.getElementById('cClinStatus').value,
    drugGroup: 'Группа ' + document.getElementById('cDrugGrp').value,
    drug: document.getElementById('cDrug').value,
    drugJustification: document.getElementById('cDrugJust').value,
    docs,
    status: 'step1',
    createdAt: today(),
    sentDate: null,
    deadline: null,
    decision: false,
    decisionDate: null,
    decisionNote: null,
  });
  DB.set('consiliums', cases);
  closeModal();
  showToast('Заявка создана — ШАГ 1: Верификация диагноза', 'success');
  renderPage();
}

// ══════════════════════════════════════════════════════════════
// PAGE: ROUNDS (заведующий)
// ══════════════════════════════════════════════════════════════
function rounds() {
  const pts = DB.get('patients');
  const red = pts.filter(p => getZone(p) === 'red');
  const yellow = pts.filter(p => getZone(p) === 'yellow');
  const icu = pts.filter(p => p.ward === 'ОРИТ');
  const pit = pts.filter(p => p.ward === 'ПИТ');
  const onVent = pts.filter(p => p.resp === 'ИВЛ');
  const fn = pts.filter(p => p.complications?.includes('Febr'));
  const sepsis = pts.filter(p => p.complications?.some(c => c.includes('Сепс')));
  const fnAll = pts.filter(p => p.complications?.includes('Феб') || (p.labs?.neutro < 0.5 && p.vitals?.temp >= 38));

  const now = new Date();
  const reportDate = now.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

  return `
  <div class="card" style="margin-bottom:16px">
    <div class="report-title">📋 Рапорт заведующего гематологическим отделением</div>
    <div class="report-subtitle">Дата: ${reportDate} · Сформировано: ${now.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})}</div>
    <div class="divider"></div>

    <div class="report-grid">
      <div class="report-stat"><div class="report-stat-val" style="color:var(--blue)">${pts.length}</div><div class="report-stat-lbl">Всего пациентов в ПИТ/ОРИТ</div></div>
      <div class="report-stat"><div class="report-stat-val" style="color:var(--red)">${red.length}</div><div class="report-stat-lbl">Красная зона</div></div>
      <div class="report-stat"><div class="report-stat-val" style="color:var(--yellow)">${yellow.length}</div><div class="report-stat-lbl">Жёлтая зона</div></div>
      <div class="report-stat"><div class="report-stat-val" style="color:var(--purple)">${onVent.length}</div><div class="report-stat-lbl">На ИВЛ</div></div>
      <div class="report-stat"><div class="report-stat-val">${icu.length}</div><div class="report-stat-lbl">В ОРИТ</div></div>
      <div class="report-stat"><div class="report-stat-val">${pit.length}</div><div class="report-stat-lbl">В ПИТ</div></div>
      <div class="report-stat"><div class="report-stat-val" style="color:var(--red)">${sepsis.length}</div><div class="report-stat-lbl">Сепсис/шок</div></div>
      <div class="report-stat"><div class="report-stat-val" style="color:var(--yellow)">${fnAll.length}</div><div class="report-stat-lbl">Нейтроп. лихорадка</div></div>
    </div>

    <div class="divider"></div>
    <div class="card-title" style="margin-bottom:12px">🔴 Пациенты красной зоны</div>
    ${red.length ? red.map(p => {
      const sofa = calcSOFA(p.vitals, p.labs);
      const news = calcNEWS2(p.vitals, p.labs);
      return `<div style="border:1px solid var(--red);border-radius:8px;padding:12px;margin-bottom:8px;background:var(--red-light)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${p.name}</strong> · ${p.age} л · ${p.diagnosis}</div>
          <div style="display:flex;gap:8px">
            <span class="score-chip sofa">SOFA: ${sofa}</span>
            <span class="score-chip news">NEWS2: ${news}</span>
          </div>
        </div>
        <div style="font-size:12px;color:var(--gray-600);margin-top:4px">
          ${p.ward} · Пал.${p.room} · Врач: ${p.doctor} · ${daysSince(p.admitDate)} дн.
        </div>
        ${p.complications?.length ? `<div style="font-size:11px;margin-top:4px;color:var(--red-dark)">Осложнения: ${p.complications.join(', ')}</div>` : ''}
      </div>`;
    }).join('') : '<div class="alert alert-green">Пациентов в красной зоне нет</div>'}

    <div class="divider"></div>
    <div class="card-title" style="margin-bottom:12px">🟡 Пациенты жёлтой зоны</div>
    ${yellow.length ? yellow.map(p => `
      <div style="border:1px solid var(--yellow);border-radius:8px;padding:10px;margin-bottom:6px;background:var(--yellow-light)">
        <strong>${p.name}</strong> · ${p.diagnosis} · ${p.ward} · SOFA: ${calcSOFA(p.vitals,p.labs)} · NEWS2: ${calcNEWS2(p.vitals,p.labs)}
      </div>`).join('') : '<div class="alert alert-green">Пациентов в жёлтой зоне нет</div>'}

    <div class="divider"></div>
    <button class="btn btn-primary" onclick="printReport()">🖨 Распечатать рапорт</button>
    <button class="btn btn-secondary" style="margin-left:8px" onclick="exportReport()">📄 Экспорт</button>
  </div>`;
}

function printReport() { window.print(); }
function exportReport() { showToast('Рапорт скопирован в буфер', 'success'); }

// ══════════════════════════════════════════════════════════════
// PAGE: ANALYTICS
// ══════════════════════════════════════════════════════════════
function analytics() {
  const pts = DB.get('patients');
  const total = pts.length;
  const dead = 0; // demo
  const compCounts = {};
  pts.forEach(p => (p.complications||[]).forEach(c => { compCounts[c] = (compCounts[c]||0)+1; }));
  const topComps = Object.entries(compCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const avgDays = total ? Math.round(pts.reduce((s,p)=>s+daysSince(p.admitDate),0)/total) : 0;
  const allTransf = pts.flatMap(p=>p.transfusions||[]);

  return `
  <div class="grid grid-4" style="margin-bottom:16px">
    <div class="stat-card blue"><div class="stat-label">Всего пациентов</div><div class="stat-value">${total}</div></div>
    <div class="stat-card green"><div class="stat-label">Ср. длительность</div><div class="stat-value">${avgDays}</div><div class="stat-sub">дней</div></div>
    <div class="stat-card yellow"><div class="stat-label">Трансфузии</div><div class="stat-value">${allTransf.length}</div><div class="stat-sub">компонентов</div></div>
    <div class="stat-card red"><div class="stat-label">Летальность</div><div class="stat-value">${total?Math.round(dead/total*100):0}%</div></div>
  </div>

  <div class="grid grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">📊 Структура диагнозов</div></div>
      ${['ОМЛ','ОЛЛ','МДС','ММ','Лимфомы','АА','ХМЛ','ПНГ'].map(dx => {
        const cnt = pts.filter(p=>p.diagnosis===dx).length;
        const pct = total ? Math.round(cnt/total*100) : 0;
        return cnt ? `<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
            <span style="font-weight:500">${dx}</span>
            <span style="font-weight:700">${cnt} (${pct}%)</span>
          </div>
          <div class="progress"><div class="progress-bar blue" style="width:${pct}%;background:var(--blue)"></div></div>
        </div>` : '';
      }).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">⚠️ Частота осложнений</div></div>
      ${topComps.length ? topComps.map(([name, cnt]) => {
        const pct = total ? Math.round(cnt/total*100) : 0;
        return `<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span>${name}</span>
            <span style="font-weight:700">${cnt} (${pct}%)</span>
          </div>
          <div class="progress"><div class="progress-bar ${pct>50?'red':pct>25?'yellow':'green'}" style="width:${pct}%"></div></div>
        </div>`;
      }).join('') : '<p style="color:var(--gray-400)">Осложнений не зарегистрировано</p>'}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🩸 Трансфузионная нагрузка</div></div>
      ${['ЭМ','ТК','СЗП'].map(type => {
        const cnt = allTransf.filter(t=>t.type===type).length;
        const vol = allTransf.filter(t=>t.type===type).reduce((s,t)=>s+t.vol,0);
        return `<div style="display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--gray-200);border-radius:8px;margin-bottom:8px">
          <span style="font-size:24px">${type==='ЭМ'?'🔴':type==='ТК'?'🟡':'🟠'}</span>
          <div style="flex:1">
            <div style="font-weight:600">${type} — ${cnt} трансфузий</div>
            <div style="font-size:12px;color:var(--gray-500)">Объём: ${vol} мл</div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Ежемесячный отчёт</div></div>
      <div style="font-size:13px;color:var(--gray-600);line-height:1.8">
        <div>🏥 Пациентов в ПИТ/ОРИТ: <strong>${total}</strong></div>
        <div>📅 Средняя длительность: <strong>${avgDays} дн.</strong></div>
        <div>🩸 Компоненты крови: <strong>${allTransf.length}</strong></div>
        <div>⚠️ С осложнениями: <strong>${pts.filter(p=>p.complications?.length).length}</strong></div>
        <div>🔴 Максим. SOFA: <strong>${Math.max(...pts.map(p=>calcSOFA(p.vitals,p.labs)))}</strong></div>
      </div>
      <div class="divider"></div>
      <button class="btn btn-primary btn-sm" onclick="showToast('Отчёт формируется...','success')">📄 Сформировать отчёт</button>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════════════════════════
function openModal(title, body) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modal').classList.add('active');
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
  document.getElementById('modalOverlay').classList.remove('active');
}

// ── Add Patient Modal ────────────────────────────────────────
function showAddPatientModal() {
  openModal('Новый пациент', `
    <div class="form-section">
      <div class="form-section-title">Персональные данные</div>
      <div class="form-row">
        <div class="form-group"><label>ФИО *</label><input id="pName" placeholder="Фамилия Имя Отчество"></div>
        <div class="form-group"><label>ИИН *</label><input id="pIIN" placeholder="12 цифр" maxlength="12"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Возраст</label><input id="pAge" type="number" placeholder="лет"></div>
        <div class="form-group"><label>Дата госпитализации</label><input id="pAdmit" type="date" value="${today()}"></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Медицинские данные</div>
      <div class="form-row">
        <div class="form-group"><label>Основной диагноз *</label>
          <select id="pDx">
            ${['ОМЛ','ОЛЛ','МДС','ММ','Лимфомы','ХМЛ','ПНГ','АА','Другое'].map(d=>`<option>${d}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Отделение</label>
          <select id="pWard"><option>ПИТ</option><option>ОРИТ</option></select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Палата</label><input id="pRoom" placeholder="№"></div>
        <div class="form-group"><label>Ответственный врач</label><input id="pDoctor" placeholder="Ф.И.О."></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Исходные витальные</div>
      <div class="form-row-3">
        <div class="form-group"><label>Температура °C</label><input id="vTemp" type="number" step="0.1" value="36.6"></div>
        <div class="form-group"><label>АД сист.</label><input id="vSbp" type="number" value="120"></div>
        <div class="form-group"><label>АД диаст.</label><input id="vDbp" type="number" value="80"></div>
        <div class="form-group"><label>ЧСС уд/мин</label><input id="vHr" type="number" value="80"></div>
        <div class="form-group"><label>ЧДД /мин</label><input id="vRr" type="number" value="16"></div>
        <div class="form-group"><label>SpO2 %</label><input id="vSpo2" type="number" value="98"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Диурез мл/сут</label><input id="vUrine" type="number" value="1500"></div>
        <div class="form-group"><label>GCS</label><input id="vGcs" type="number" value="15" min="3" max="15"></div>
      </div>
      <div class="form-group">
        <label>Респираторная поддержка</label>
        <select id="vResp"><option>нет</option><option>O2</option><option>HFNC</option><option>NIV</option><option>ИВЛ</option></select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveNewPatient()">Сохранить пациента</button>
    </div>`);
}

function saveNewPatient() {
  const name = document.getElementById('pName').value.trim();
  const iin = document.getElementById('pIIN').value.trim();
  if (!name || !iin) { showToast('Заполните ФИО и ИИН', 'error'); return; }
  const pts = DB.get('patients');
  const p = {
    id: DB.genId(), name, iin,
    age: +document.getElementById('pAge').value || 0,
    diagnosis: document.getElementById('pDx').value,
    ward: document.getElementById('pWard').value,
    room: document.getElementById('pRoom').value,
    doctor: document.getElementById('pDoctor').value,
    admitDate: document.getElementById('pAdmit').value || today(),
    zone: 'green',
    vitals: {
      temp: +document.getElementById('vTemp').value || 36.6,
      sbp: +document.getElementById('vSbp').value || 120,
      dbp: +document.getElementById('vDbp').value || 80,
      hr: +document.getElementById('vHr').value || 80,
      rr: +document.getElementById('vRr').value || 16,
      spo2: +document.getElementById('vSpo2').value || 98,
      urine: +document.getElementById('vUrine').value || 1500
    },
    resp: document.getElementById('vResp').value,
    gcs: +document.getElementById('vGcs').value || 15,
    delirium: false,
    labs: { hb:null,wbc:null,neutro:null,plt:null,creat:null,urea:null,alt:null,ast:null,bili:null,alb:null,mno:null,aptt:null,fibr:null,ddimer:null,crp:null,pct:null,ferr:null,lactate:null },
    complications: [], therapy: [], transfusions: []
  };
  pts.push(p);
  DB.set('patients', pts);
  closeModal();
  showToast('Пациент добавлен', 'success');
  renderPage();
}

// ── Add Vitals Modal ─────────────────────────────────────────
function showAddVitalsModal(id) {
  const p = DB.get('patients').find(x => x.id === id);
  if (!p) return;
  openModal(`Витальные — ${p.name.split(' ')[0]} ${p.name.split(' ')[1]}`, `
    <div class="form-section-title">Витальные показатели · ${new Date().toLocaleDateString('ru-RU')}</div>
    <div class="form-row-3">
      <div class="form-group"><label>Температура °C</label><input id="vTemp" type="number" step="0.1" value="${p.vitals.temp}"></div>
      <div class="form-group"><label>АД сист.</label><input id="vSbp" type="number" value="${p.vitals.sbp}"></div>
      <div class="form-group"><label>АД диаст.</label><input id="vDbp" type="number" value="${p.vitals.dbp}"></div>
      <div class="form-group"><label>ЧСС уд/мин</label><input id="vHr" type="number" value="${p.vitals.hr}"></div>
      <div class="form-group"><label>ЧДД /мин</label><input id="vRr" type="number" value="${p.vitals.rr}"></div>
      <div class="form-group"><label>SpO2 %</label><input id="vSpo2" type="number" value="${p.vitals.spo2}"></div>
      <div class="form-group"><label>Диурез мл/сут</label><input id="vUrine" type="number" value="${p.vitals.urine}"></div>
      <div class="form-group"><label>GCS (3–15)</label><input id="vGcs" type="number" value="${p.gcs}" min="3" max="15"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Респираторная поддержка</label>
        <select id="vResp">
          ${['нет','O2','HFNC','NIV','ИВЛ'].map(r=>`<option ${p.resp===r?'selected':''}>${r}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Делирий</label>
        <select id="vDelirium"><option value="0" ${!p.delirium?'selected':''}>Нет</option><option value="1" ${p.delirium?'selected':''}>Да</option></select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveVitals('${id}')">Сохранить</button>
    </div>`);
}

function saveVitals(id) {
  const pts = DB.get('patients');
  const p = pts.find(x => x.id === id);
  if (!p) return;
  p.vitals = {
    temp: +document.getElementById('vTemp').value,
    sbp: +document.getElementById('vSbp').value,
    dbp: +document.getElementById('vDbp').value,
    hr: +document.getElementById('vHr').value,
    rr: +document.getElementById('vRr').value,
    spo2: +document.getElementById('vSpo2').value,
    urine: +document.getElementById('vUrine').value
  };
  p.gcs = +document.getElementById('vGcs').value;
  p.resp = document.getElementById('vResp').value;
  p.delirium = document.getElementById('vDelirium').value === '1';
  DB.set('patients', pts);
  closeModal();
  showToast('Витальные обновлены', 'success');
  renderPage();
}

// ── Lab Modal ────────────────────────────────────────────────
function showLabModal(id) {
  const p = DB.get('patients').find(x => x.id === id);
  if (!p) return;
  const l = p.labs || {};
  openModal(`Лабораторные данные — ${p.name.split(' ')[0]} ${p.name.split(' ')[1]}`, `
    <div class="form-section">
      <div class="form-section-title">ОАК</div>
      <div class="form-row-3">
        <div class="form-group"><label>Hb (г/л)</label><input id="lHb" type="number" step="1" value="${l.hb??''}"></div>
        <div class="form-group"><label>Лейкоциты (×10⁹)</label><input id="lWbc" type="number" step="0.1" value="${l.wbc??''}"></div>
        <div class="form-group"><label>Нейтрофилы (×10⁹)</label><input id="lNeutro" type="number" step="0.01" value="${l.neutro??''}"></div>
        <div class="form-group"><label>Тромбоциты (×10⁹)</label><input id="lPlt" type="number" value="${l.plt??''}"></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Биохимия</div>
      <div class="form-row-3">
        <div class="form-group"><label>Креатинин (мкмоль/л)</label><input id="lCreat" type="number" value="${l.creat??''}"></div>
        <div class="form-group"><label>Мочевина (ммоль/л)</label><input id="lUrea" type="number" step="0.1" value="${l.urea??''}"></div>
        <div class="form-group"><label>АЛТ (Ед/л)</label><input id="lAlt" type="number" value="${l.alt??''}"></div>
        <div class="form-group"><label>АСТ (Ед/л)</label><input id="lAst" type="number" value="${l.ast??''}"></div>
        <div class="form-group"><label>Билирубин (мкмоль/л)</label><input id="lBili" type="number" step="0.1" value="${l.bili??''}"></div>
        <div class="form-group"><label>Альбумин (г/л)</label><input id="lAlb" type="number" step="0.1" value="${l.alb??''}"></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Коагулограмма</div>
      <div class="form-row-3">
        <div class="form-group"><label>МНО</label><input id="lMno" type="number" step="0.1" value="${l.mno??''}"></div>
        <div class="form-group"><label>АЧТВ (сек)</label><input id="lAptt" type="number" step="0.1" value="${l.aptt??''}"></div>
        <div class="form-group"><label>Фибриноген (г/л)</label><input id="lFibr" type="number" step="0.1" value="${l.fibr??''}"></div>
        <div class="form-group"><label>D-димер (мкг/мл)</label><input id="lDdimer" type="number" step="0.1" value="${l.ddimer??''}"></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Маркеры воспаления</div>
      <div class="form-row-3">
        <div class="form-group"><label>CRP (мг/л)</label><input id="lCrp" type="number" step="0.1" value="${l.crp??''}"></div>
        <div class="form-group"><label>ПКТ (нг/мл)</label><input id="lPct" type="number" step="0.01" value="${l.pct??''}"></div>
        <div class="form-group"><label>Ферритин (мкг/л)</label><input id="lFerr" type="number" value="${l.ferr??''}"></div>
        <div class="form-group"><label>Лактат (ммоль/л)</label><input id="lLactate" type="number" step="0.1" value="${l.lactate??''}"></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveLabs('${id}')">Сохранить</button>
    </div>`);
}

function saveLabs(id) {
  const pts = DB.get('patients');
  const p = pts.find(x => x.id === id);
  if (!p) return;
  const g = field => { const v = document.getElementById(field)?.value; return v !== '' && v !== undefined ? +v : null; };
  p.labs = { hb:g('lHb'), wbc:g('lWbc'), neutro:g('lNeutro'), plt:g('lPlt'), creat:g('lCreat'), urea:g('lUrea'), alt:g('lAlt'), ast:g('lAst'), bili:g('lBili'), alb:g('lAlb'), mno:g('lMno'), aptt:g('lAptt'), fibr:g('lFibr'), ddimer:g('lDdimer'), crp:g('lCrp'), pct:g('lPct'), ferr:g('lFerr'), lactate:g('lLactate') };
  DB.set('patients', pts);
  closeModal();
  showToast('Лабораторные данные сохранены', 'success');
  renderPage();
}

// ── Edit Patient Modal ───────────────────────────────────────
function showEditPatientModal(id) {
  const p = DB.get('patients').find(x => x.id === id);
  if (!p) return;
  openModal('Редактировать пациента', `
    <div class="form-row">
      <div class="form-group"><label>ФИО</label><input id="eName" value="${p.name}"></div>
      <div class="form-group"><label>Возраст</label><input id="eAge" type="number" value="${p.age}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Диагноз</label>
        <select id="eDx">${['ОМЛ','ОЛЛ','МДС','ММ','Лимфомы','ХМЛ','ПНГ','АА','Другое'].map(d=>`<option ${p.diagnosis===d?'selected':''}>${d}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label>Отделение</label>
        <select id="eWard"><option ${p.ward==='ПИТ'?'selected':''}>ПИТ</option><option ${p.ward==='ОРИТ'?'selected':''}>ОРИТ</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Палата</label><input id="eRoom" value="${p.room}"></div>
      <div class="form-group"><label>Врач</label><input id="eDoctor" value="${p.doctor}"></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Добавить терапию</div>
      <div class="form-row">
        <div class="form-group"><label>Препарат</label><input id="tName" placeholder="Название"></div>
        <div class="form-group"><label>Доза/режим</label><input id="tDose" placeholder="напр. 2 г х 3"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Тип</label>
          <select id="tType">${['АБ','ПГ','ПВ','ТКИ','ХТ','ИТ','ГКС','АКГ'].map(t=>`<option>${t}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Дата начала</label><input id="tStart" type="date" value="${today()}"></div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="addTherapyLine('${id}')">+ Добавить препарат</button>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveEditPatient('${id}')">Сохранить</button>
    </div>`);
}

function addTherapyLine(id) {
  const name = document.getElementById('tName')?.value.trim();
  const dose = document.getElementById('tDose')?.value.trim();
  const type = document.getElementById('tType')?.value;
  const start = document.getElementById('tStart')?.value;
  if (!name) { showToast('Введите название препарата', 'error'); return; }
  const pts = DB.get('patients');
  const p = pts.find(x => x.id === id);
  if (!p) return;
  p.therapy = p.therapy || [];
  p.therapy.push({ name, dose, type, start: start || today() });
  DB.set('patients', pts);
  showToast(`${name} добавлен`, 'success');
  document.getElementById('tName').value = '';
  document.getElementById('tDose').value = '';
}

function saveEditPatient(id) {
  const pts = DB.get('patients');
  const p = pts.find(x => x.id === id);
  if (!p) return;
  p.name = document.getElementById('eName').value;
  p.age = +document.getElementById('eAge').value;
  p.diagnosis = document.getElementById('eDx').value;
  p.ward = document.getElementById('eWard').value;
  p.room = document.getElementById('eRoom').value;
  p.doctor = document.getElementById('eDoctor').value;
  DB.set('patients', pts);
  closeModal();
  showToast('Данные обновлены', 'success');
  renderPage();
}

// ── Transfusion Modal ────────────────────────────────────────
function showTransfusionModal() {
  const pts = DB.get('patients');
  openModal('Внести трансфузию', `
    <div class="form-group"><label>Пациент</label>
      <select id="trPat">${pts.map(p=>`<option value="${p.id}">${p.name.split(' ').slice(0,2).join(' ')} — ${p.diagnosis}</option>`).join('')}</select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Компонент</label>
        <select id="trType"><option>ЭМ</option><option>ТК</option><option>СЗП</option><option>КП</option></select>
      </div>
      <div class="form-group"><label>Объём (мл)</label><input id="trVol" type="number" value="340"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Дата</label><input id="trDate" type="date" value="${today()}"></div>
      <div class="form-group"><label>Трансфузионная реакция</label>
        <select id="trReact"><option value="0">Нет</option><option value="1">Да</option></select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveTransfusion()">Сохранить</button>
    </div>`);
}

function saveTransfusion() {
  const pts = DB.get('patients');
  const id = document.getElementById('trPat').value;
  const p = pts.find(x => x.id === id);
  if (!p) return;
  p.transfusions = p.transfusions || [];
  p.transfusions.push({
    type: document.getElementById('trType').value,
    vol: +document.getElementById('trVol').value,
    date: document.getElementById('trDate').value,
    reaction: document.getElementById('trReact').value === '1'
  });
  DB.set('patients', pts);
  closeModal();
  showToast('Трансфузия внесена', 'success');
  renderPage();
}

// ── DateTime ─────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('dateTime');
  if (el) el.textContent = new Date().toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDemoData();
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });
  updateClock();
  setInterval(updateClock, 60000);
  navigate('dashboard');
});
