/* =========================================================
   KNX / ETS6 — manual interactivo
   Datos alineados con la Especificación Maestra V1.0.
   Las direcciones de ejemplo (1/1/07, 3/2/01, etc.) son una
   convención ilustrativa para este manual; cada proyecto real
   define su propio grupo medio siempre que sea consistente.
   ========================================================= */

const pad2 = n => String(n).padStart(2, '0');

/* ---------- 1. NAVEGACIÓN ---------- */
const treeLinks = document.querySelectorAll('.tree-link');
const panels = document.querySelectorAll('[data-panel]');
const tree = document.getElementById('tree');
const navToggle = document.getElementById('navToggle');

function showSection(id) {
  panels.forEach(p => p.hidden = p.id !== id);
  treeLinks.forEach(l => l.classList.toggle('is-active', l.dataset.section === id));
  tree.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}

treeLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.dataset.section;
    showSection(id);
    history.replaceState(null, '', '#' + id);
    document.getElementById('content').scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

navToggle.addEventListener('click', () => {
  const open = tree.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

const initial = location.hash ? location.hash.slice(1) : 'inicio';
showSection(document.getElementById(initial) ? initial : 'inicio');

/* ---------- 2. HERO SWITCH ---------- */
const heroSwitch = document.getElementById('heroSwitch');
const heroTelegram = document.getElementById('heroTelegram');
heroSwitch.addEventListener('click', () => {
  const on = heroSwitch.getAttribute('aria-pressed') !== 'true';
  heroSwitch.setAttribute('aria-pressed', String(on));
  heroTelegram.innerHTML =
    `<b>1/1/07</b> &nbsp;DPT 1.001&nbsp; → &nbsp;valor <b>${on ? '1 (ON)' : '0 (OFF)'}</b>`;
});

/* ---------- 3. CONSTRUCTOR DE DIRECCIONES ---------- */
const gaMain = document.getElementById('gaMain');
const gaMiddle = document.getElementById('gaMiddle');
const gaSub = document.getElementById('gaSub');
const gaResultValue = document.getElementById('gaResultValue');

function updateGaResult() {
  const m = gaMain.value || 0;
  const g = gaMiddle.value || 0;
  const x = pad2(gaSub.value || 0);
  gaResultValue.textContent = `${m}/${g}/${x}`;
}
[gaMain, gaMiddle, gaSub].forEach(i => i.addEventListener('input', updateGaResult));
updateGaResult();

/* ---------- 4. TABLA DPT ---------- */
const DPT_DATA = [
  { func: 'ON/OFF', dpt: '1.001', value: 'Booleano (0/1)', cat: 'Iluminación' },
  { func: 'Estado ON/OFF', dpt: '1.001', value: 'Booleano (0/1)', cat: 'Iluminación' },
  { func: 'Regulación relativa', dpt: '3.007', value: 'Control 4 bit (paso + dirección)', cat: 'Iluminación' },
  { func: 'Valor absoluto 0–100 %', dpt: '5.001', value: 'Escalar sin signo (0–255 → %)', cat: 'Iluminación' },
  { func: 'Estado valor 0–100 %', dpt: '5.001', value: 'Escalar sin signo (0–255 → %)', cat: 'Iluminación' },
  { func: 'Temperatura ambiente', dpt: '9.001', value: 'Coma flotante 2 bytes (°C)', cat: 'Clima' },
  { func: 'Temperatura de consigna', dpt: '9.001', value: 'Coma flotante 2 bytes (°C)', cat: 'Clima' },
  { func: 'Modo HVAC (objeto estándar)', dpt: '20.102', value: 'Enumerado 1 byte', cat: 'Clima' },
  { func: 'Control de escena', dpt: '18.001', value: 'Número de escena 1 byte', cat: 'Escenas' },
];

const dptTableBody = document.querySelector('#dptTable tbody');
function renderDpt(filter) {
  dptTableBody.innerHTML = DPT_DATA
    .filter(d => filter === 'all' || d.cat === filter)
    .map(d => `<tr><td>${d.func}</td><td>${d.dpt}</td><td>${d.value}</td><td>${d.cat}</td></tr>`)
    .join('');
}
renderDpt('all');
document.getElementById('dptFilters').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  document.querySelectorAll('#dptFilters .chip').forEach(c => c.classList.remove('is-active'));
  btn.classList.add('is-active');
  renderDpt(btn.dataset.filter);
});

/* ---------- 5. MÓDULOS ---------- */
const MODULES = [
  { id: 'LIGHT_SIMPLE', title: 'LIGHT_SIMPLE · Luz ON/OFF', status: 'APROBADO',
    required: ['ON/OFF'], optional: ['Estado ON/OFF'] },
  { id: 'LIGHT_DIM', title: 'LIGHT_DIM · Luz regulable', status: 'APROBADO',
    required: ['ON/OFF', 'Regulación relativa', 'Valor absoluto'],
    optional: ['Estado ON/OFF', 'Estado valor'] },
  { id: 'BLIND_STANDARD', title: 'BLIND_STANDARD · Persiana', status: 'APROBADO',
    required: ['Mover', 'Stop', 'Posición deseada %', 'Estado movimiento', 'Posición estado %'],
    optional: ['Lamas', 'Estado lamas', 'Bloqueo', 'Viento', 'Automatismo'] },
  { id: 'UFH_ZONE', title: 'UFH_ZONE · Suelo radiante', status: 'APROBADO',
    required: ['Habilitación / ON-OFF', 'Temperatura ambiente', 'Consigna', 'Estado consigna', 'Modo', 'Estado modo', 'Demanda / posición válvula'],
    optional: ['Estado temperatura (si existe)', 'Estado válvula (según dispositivo)', 'Fallo (según dispositivo)'] },
  { id: 'HVAC_ZONE', title: 'HVAC_ZONE · Aire acondicionado', status: 'APROBADO',
    required: ['ON/OFF', 'Estado', 'Temperatura ambiente', 'Estado temperatura', 'Consigna', 'Estado consigna', 'Modo', 'Estado modo'],
    optional: ['Velocidad ventilador', 'Automático ventilador', 'Estado velocidad', 'Error (según dispositivo)'] },
  { id: 'SCENE', title: 'SCENE · Escena KNX', status: 'APROBADO',
    required: ['scene_id', 'nombre', 'número', 'funciones afectadas'],
    optional: ['Guardar / aprender (si el dispositivo lo permite)'] },
];

document.getElementById('moduleGrid').innerHTML = MODULES.map(m => `
  <div class="module-card">
    <h3>${m.title}<span class="module-status">${m.status}</span></h3>
    <ul class="module-list">
      ${m.required.map(r => `<li><b class="tag-req">Obligatorio</b>${r}</li>`).join('')}
      ${m.optional.map(o => `<li><b class="tag-opt">Recomendado</b>${o}</li>`).join('')}
    </ul>
  </div>
`).join('');

/* ---------- 6. SIMULADOR DE PULSADOR ---------- */
const CIRCUITS = {
  '07': 'Luz Techo Salón',
  '08': 'Luz Lectura Salón',
};

const SHORT_OPTIONS = [
  { v: 'none', label: 'Sin asignar' },
  { v: 'on_07', label: 'Encender Luz Techo (07)' },
  { v: 'off_07', label: 'Apagar Luz Techo (07)' },
  { v: 'toggle_07', label: 'Alternar Luz Techo (07)' },
  { v: 'on_08', label: 'Encender Luz Lectura (08)' },
  { v: 'off_08', label: 'Apagar Luz Lectura (08)' },
  { v: 'toggle_08', label: 'Alternar Luz Lectura (08)' },
  { v: 'scene_1', label: 'Evocar escena 1 (Ambiente día)' },
  { v: 'scene_2', label: 'Evocar escena 2 (Ambiente noche)' },
];
const LONG_OPTIONS = [
  { v: 'none', label: 'Sin regulación' },
  { v: 'dim_up_07', label: 'Regular + Luz Techo (07)' },
  { v: 'dim_down_07', label: 'Regular − Luz Techo (07)' },
  { v: 'dim_up_08', label: 'Regular + Luz Lectura (08)' },
  { v: 'dim_down_08', label: 'Regular − Luz Lectura (08)' },
];

const DEFAULTS_BY_COUNT = {
  '1': [{ s: 'toggle_07', l: 'dim_up_07' }],
  '2': [{ s: 'on_07', l: 'dim_up_07' }, { s: 'off_07', l: 'dim_down_07' }],
  '4': [
    { s: 'on_07', l: 'dim_up_07' },
    { s: 'off_07', l: 'dim_down_07' },
    { s: 'toggle_08', l: 'none' },
    { s: 'scene_1', l: 'none' },
  ],
};

function addressFor(code) {
  if (code === 'none') return null;
  if (code.startsWith('scene_')) {
    const n = code.split('_')[1];
    return { ga: '1/4/01', dpt: '18.001', label: `Control de escena → nº ${n}`, circuit: '—' };
  }
  const parts = code.split('_');
  const circuit = parts[parts.length - 1];
  const isDim = code.startsWith('dim_');
  return isDim
    ? { ga: `1/2/${circuit}`, dpt: '3.007', label: `Regulación · ${CIRCUITS[circuit]}`, circuit }
    : { ga: `1/1/${circuit}`, dpt: '1.001', label: `ON/OFF · ${CIRCUITS[circuit]}`, circuit };
}

let buttonConfig = [];

function buildOptionsHtml(options, selected) {
  return options.map(o => `<option value="${o.v}" ${o.v === selected ? 'selected' : ''}>${o.label}</option>`).join('');
}

function renderButtonRows() {
  const count = document.getElementById('btnCount').value;
  buttonConfig = DEFAULTS_BY_COUNT[count].map(d => ({ ...d }));
  const container = document.getElementById('buttonRows');
  container.innerHTML = buttonConfig.map((cfg, i) => `
    <div class="button-row">
      <p class="button-row-title">Tecla ${i + 1}</p>
      <label for="short-${i}">Pulsación corta</label>
      <select id="short-${i}" data-idx="${i}" data-kind="s">${buildOptionsHtml(SHORT_OPTIONS, cfg.s)}</select>
      <label for="long-${i}">Pulsación larga</label>
      <select id="long-${i}" data-idx="${i}" data-kind="l">${buildOptionsHtml(LONG_OPTIONS, cfg.l)}</select>
    </div>
  `).join('');
  container.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('change', () => {
      const idx = Number(sel.dataset.idx);
      buttonConfig[idx][sel.dataset.kind] = sel.value;
      renderDeviceButtons();
      renderPulsadorGaTable();
    });
  });
  renderDeviceButtons();
  renderPulsadorGaTable();
}

function renderDeviceButtons() {
  const wrap = document.getElementById('deviceButtons');
  wrap.innerHTML = buttonConfig.map((cfg, i) =>
    `<button class="device-btn" data-idx="${i}">Tecla ${i + 1}</button>`
  ).join('');
  wrap.querySelectorAll('.device-btn').forEach(btn => {
    let pressTimer = null;
    let longFired = false;
    btn.addEventListener('pointerdown', () => {
      longFired = false;
      btn.classList.add('is-pressed');
      pressTimer = setTimeout(() => {
        longFired = true;
        firePress(Number(btn.dataset.idx), 'l');
      }, 550);
    });
    const release = () => {
      btn.classList.remove('is-pressed');
      clearTimeout(pressTimer);
      if (!longFired) firePress(Number(btn.dataset.idx), 's');
    };
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', () => clearTimeout(pressTimer));
  });
}

function logLine(container, addr) {
  const empty = container.querySelector('.telegram-log-empty');
  if (empty) empty.remove();
  const line = document.createElement('p');
  line.className = 'telegram-line';
  line.innerHTML = `<span class="t-addr">${addr.ga}</span><span class="t-dpt">${addr.dpt}</span><span class="t-val">${addr.label}</span>`;
  container.prepend(line);
}

function firePress(idx, kind) {
  const code = buttonConfig[idx][kind];
  const addr = addressFor(code);
  if (!addr) return;
  logLine(document.getElementById('pulsadorLog'), addr);
}

function renderPulsadorGaTable() {
  const seen = new Map();
  buttonConfig.forEach(cfg => {
    [cfg.s, cfg.l].forEach(code => {
      const addr = addressFor(code);
      if (addr && !seen.has(addr.ga)) seen.set(addr.ga, addr);
    });
  });
  const rows = [...seen.values()];
  const tbody = document.querySelector('#pulsadorGaTable tbody');
  tbody.innerHTML = rows.length
    ? rows.map(a => `<tr><td>${a.ga}</td><td>${a.label.split(' · ')[0]}</td><td>${a.dpt}</td><td>${a.circuit}</td></tr>`).join('')
    : `<tr><td colspan="4" style="color:var(--text-faint)">Ninguna tecla tiene una acción asignada todavía.</td></tr>`;
}

document.getElementById('btnCount').addEventListener('change', renderButtonRows);
renderButtonRows();

/* ---------- 7. ESCENAS ---------- */
const SCENE_NAMES = {
  1: 'Buenas noches', 2: 'Buenos días', 3: 'Cine', 4: 'Fuera de casa',
  5: 'Personalizada 5', 6: 'Personalizada 6', 7: 'Personalizada 7', 8: 'Personalizada 8',
};
const SCENE_MEMBERS = [
  { name: 'Luz Techo Salón', options: ['Apagada', 'Encendida 30 %', 'Encendida 100 %'] },
  { name: 'Luz Lectura Salón', options: ['Apagada', 'Encendida 60 %', 'Encendida 100 %'] },
  { name: 'Persiana Dormitorio Ppal.', options: ['Abierta 0 %', 'Semi 50 %', 'Cerrada 100 %'] },
  { name: 'Clima Salón (consigna)', options: ['18 °C · ahorro', '21 °C · confort', '23 °C · calor'] },
];

const sceneNumberInput = document.getElementById('sceneNumber');
const sceneNumberDisplay = document.getElementById('sceneNumberDisplay');
const sceneMembersEl = document.getElementById('sceneMembers');
let sceneState = {}; // sceneState[num][memberIndex] = optionIndex

function defaultOptionIndex(num, memberIdx, optCount) {
  return (num + memberIdx) % optCount;
}

function ensureScene(num) {
  if (sceneState[num]) return;
  sceneState[num] = SCENE_MEMBERS.map((m, i) => defaultOptionIndex(num, i, m.options.length));
}

function renderSceneMembers() {
  const num = Number(sceneNumberInput.value);
  ensureScene(num);
  sceneNumberDisplay.textContent = `Escena ${num} · «${SCENE_NAMES[num]}»`;
  sceneMembersEl.innerHTML = SCENE_MEMBERS.map((m, i) => `
    <div class="scene-member">
      <span>${m.name}</span>
      <select data-member="${i}">
        ${m.options.map((o, oi) => `<option value="${oi}" ${oi === sceneState[num][i] ? 'selected' : ''}>${o}</option>`).join('')}
      </select>
    </div>
  `).join('');
  sceneMembersEl.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('change', () => {
      sceneState[num][Number(sel.dataset.member)] = Number(sel.value);
    });
  });
}
sceneNumberInput.addEventListener('input', renderSceneMembers);
renderSceneMembers();

document.getElementById('sceneRecallBtn').addEventListener('click', () => {
  const num = Number(sceneNumberInput.value);
  const log = document.getElementById('sceneLog');
  const empty = log.querySelector('.telegram-log-empty');
  if (empty) empty.remove();
  log.innerHTML = '';
  const header = document.createElement('p');
  header.className = 'telegram-line';
  header.innerHTML = `<span class="t-addr">1/4/01</span><span class="t-dpt">18.001</span><span class="t-val">Evocar escena ${num}</span>`;
  log.appendChild(header);
  SCENE_MEMBERS.forEach((m, i) => {
    const optIdx = sceneState[num][i];
    const line = document.createElement('p');
    line.className = 'telegram-line';
    line.style.color = 'var(--text-faint)';
    line.innerHTML = `<span class="t-addr" style="color:var(--text-faint)">↳ ${m.name}</span><span></span><span class="t-val" style="color:var(--text-dim)">aplica valor guardado: ${m.options[optIdx]}</span>`;
    log.appendChild(line);
  });
  const note = document.createElement('p');
  note.style.cssText = 'color:var(--text-faint);font-size:11.5px;margin-top:8px;border-top:1px dashed var(--border);padding-top:8px';
  note.textContent = 'Un único telegrama viaja por el bus. Cada actuador ya tenía el valor guardado en su propio parámetro.';
  log.appendChild(note);
});

/* ---------- 8. CLIMATIZACIÓN ---------- */
const CLIMATE_DATA = {
  ufh: {
    title: 'UFH_ZONE — Suelo radiante, zona Dormitorio Ppal. (circuito 01)',
    rows: [
      ['Habilitación / ON-OFF', '3/1/01', '1.001', false],
      ['Temperatura ambiente', '3/2/01', '9.001', false],
      ['Consigna', '3/3/01', '9.001', false],
      ['Estado consigna', '3/4/01', '9.001', false],
      ['Modo (si el dispositivo expone objeto estándar)', '3/5/01', '20.102', false],
      ['Demanda / posición de válvula', '—', 'PENDIENTE_VALIDACIÓN', true],
      ['Fallo', '—', 'PENDIENTE_VALIDACIÓN', true],
    ],
    note: 'La válvula y el objeto de fallo dependen del actuador de suelo radiante instalado: se confirman contra la hoja de aplicación del fabricante antes de asignarles DPT.',
  },
  hvac: {
    title: 'HVAC_ZONE — Aire acondicionado, zona Salón (circuito 01)',
    rows: [
      ['ON/OFF', '4/1/01', '1.001', false],
      ['Estado ON/OFF', '4/2/01', '1.001', false],
      ['Temperatura ambiente', '4/3/01', '9.001', false],
      ['Estado temperatura', '4/4/01', '9.001', false],
      ['Consigna', '4/5/01', '9.001', false],
      ['Estado consigna', '4/6/01', '9.001', false],
      ['Modo (objeto estándar)', '4/7/01', '20.102', false],
      ['Estado modo', '4/8/01', '20.102', false],
      ['Velocidad ventilador / automático', '—', 'PENDIENTE_VALIDACIÓN', true],
      ['Error', '—', 'PENDIENTE_VALIDACIÓN', true],
    ],
    note: 'Velocidad de ventilador y el objeto de error son específicos del perfil de la unidad interior (p. ej. pasarela AIRZONE): se documentan tras revisar el dispositivo real, nunca por defecto.',
  },
};

function renderClimate(key) {
  const d = CLIMATE_DATA[key];
  const panel = document.getElementById('climatePanel');
  panel.innerHTML = `
    <p class="ga-table-label">${d.title}</p>
    <table class="data-table mono-table">
      <thead><tr><th>Objeto</th><th>Dirección ejemplo</th><th>DPT</th></tr></thead>
      <tbody>
        ${d.rows.map(r => `<tr><td style="font-family:var(--font-ui);color:var(--text-dim)">${r[0]}</td><td>${r[1]}</td><td style="${r[3] ? 'color:var(--red)' : ''}">${r[2]}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="climate-note">${d.note}</div>
  `;
}
renderClimate('ufh');
document.querySelector('.climate-tabs').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  document.querySelectorAll('.climate-tabs .chip').forEach(c => c.classList.remove('is-active'));
  btn.classList.add('is-active');
  renderClimate(btn.dataset.climate);
});

/* ---------- 9. QUIZ ---------- */
const QUIZ = [
  { q: '¿Qué identifica el número final de una dirección M/G/X?', opts: ['El fabricante del dispositivo', 'El circuito o elemento', 'La habitación de la vivienda', 'El tipo de vivienda'], correct: 1,
    fb: 'El número final es la identidad estable del circuito: se conserva entre grupos medios y nunca se reutiliza.' },
  { q: '¿Qué DPT se usa para evocar una escena?', opts: ['1.001', '5.001', '18.001', '9.001'], correct: 2,
    fb: 'DPT 18.001 transporta el número de escena; los actuadores ya tienen el valor guardado.' },
  { q: '¿Qué objetos son obligatorios en LIGHT_DIM?', opts: ['Solo ON/OFF', 'ON/OFF, Regulación relativa y Valor absoluto', 'Solo Valor absoluto y Estado', 'ON/OFF y Modo HVAC'], correct: 1,
    fb: 'LIGHT_DIM exige ON/OFF, Regulación relativa y Valor absoluto; los estados son recomendados, no obligatorios.' },
  { q: 'Un circuito se elimina de un proyecto. ¿Se puede reutilizar su número final en un circuito nuevo?', opts: ['Sí, siempre', 'No, nunca', 'Sí, si pasó más de un año', 'Sí, si es del mismo fabricante'], correct: 1,
    fb: 'Las direcciones y números liberados no se reutilizan: rompería la trazabilidad del proyecto.' },
  { q: 'Según la convención V1.0, ¿qué rango de subgrupo se reserva a lógicas o automatismos especiales?', opts: ['000–099', '100–149', '150–179', '180–199'], correct: 2,
    fb: '150–179 es el rango de lógicas y automatismos especiales; 180–199 es la reserva del sistema.' },
  { q: 'Un objeto de fallo depende del fabricante y no está documentado. ¿Qué se hace?', opts: ['Se le asigna un DPT genérico', 'Se copia del proyecto legado', 'Se marca PENDIENTE_VALIDACIÓN y no se inventa', 'Se omite el circuito completo'], correct: 2,
    fb: 'Ante un dato de fabricante no confirmado, se marca como pendiente. Nunca se inventa un DPT ni se elimina el circuito.' },
];

let quizScore = 0;
let quizAnswered = 0;
const quizEl = document.getElementById('quiz');

function renderQuiz() {
  quizEl.innerHTML = QUIZ.map((item, qi) => `
    <div class="quiz-item" data-qi="${qi}">
      <p class="quiz-q">${qi + 1}. ${item.q}</p>
      <div class="quiz-opts">
        ${item.opts.map((o, oi) => `<button class="quiz-opt" data-oi="${oi}">${o}</button>`).join('')}
      </div>
      <p class="quiz-feedback" hidden></p>
    </div>
  `).join('') + `<p class="quiz-score" id="quizScore"></p>`;

  quizEl.querySelectorAll('.quiz-item').forEach(item => {
    const qi = Number(item.dataset.qi);
    const opts = item.querySelectorAll('.quiz-opt');
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        if (item.dataset.answered) return;
        item.dataset.answered = 'true';
        const oi = Number(opt.dataset.oi);
        const correct = QUIZ[qi].correct;
        opts.forEach((o, i) => {
          if (i === correct) o.classList.add('correct');
          else if (i === oi) o.classList.add('incorrect');
        });
        const fb = item.querySelector('.quiz-feedback');
        fb.hidden = false;
        fb.textContent = QUIZ[qi].fb;
        quizAnswered++;
        if (oi === correct) quizScore++;
        updateQuizScore();
      });
    });
  });
  updateQuizScore();
}

function updateQuizScore() {
  const el = document.getElementById('quizScore');
  if (!el) return;
  el.textContent = quizAnswered
    ? `Puntuación: ${quizScore} / ${quizAnswered} respondidas · ${QUIZ.length} preguntas en total`
    : '';
}
renderQuiz();
