/* ══════════════════════════════════════════════════════
   STUDENT TOOLKIT — SCRIPT.JS
   GPA Calculator + Pomodoro Timer + Event Manager
   All data persisted via localStorage
   ══════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════
   §1. GRADE SCALE DEFINITION
   ══════════════════════════════════════════════════════ */
const GRADE_POINTS = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F':  0.0
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

/* ══════════════════════════════════════════════════════
   §2. DOM REFERENCES
   ══════════════════════════════════════════════════════ */
// Navbar
const navGpa       = document.getElementById('navGpa');
const navTimer     = document.getElementById('navTimer');
const sectionGpa   = document.getElementById('section-gpa');
const sectionTimer = document.getElementById('section-timer');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks     = document.getElementById('navLinks');
const currentDate  = document.getElementById('currentDate');

// Theme toggle
const themeCheckbox = document.getElementById('themeCheckbox');
const themeLabel    = document.getElementById('themeLabel');

// GPA Calculator
const gpaTableBody  = document.getElementById('gpaTableBody');
const addRowBtn     = document.getElementById('addRowBtn');
const calculateBtn  = document.getElementById('calculateBtn');
const clearAllBtn   = document.getElementById('clearAllBtn');
const gpaDisplay    = document.getElementById('gpaDisplay');
const gpaResult     = document.getElementById('gpaResult');
const totalCredits  = document.getElementById('totalCredits');
const qualityPoints = document.getElementById('qualityPoints');

// Study Timer
const timerDisplay    = document.getElementById('timerDisplay');
const timerModeName   = document.getElementById('timerModeName');
const startPauseBtn   = document.getElementById('startPauseBtn');
const resetBtn        = document.getElementById('resetBtn');
const skipBtn         = document.getElementById('skipBtn');
const playIcon        = document.getElementById('playIcon');
const pauseIcon       = document.getElementById('pauseIcon');
const ringProgress    = document.getElementById('ringProgress');
const progressBarFill = document.getElementById('progressBarFill');
const sessionLog      = document.getElementById('sessionLog');
const sessionsToday   = document.getElementById('sessionsToday');
const clearLogBtn     = document.getElementById('clearLogBtn');
const modeButtons     = document.querySelectorAll('.mode-btn');
const customDurationCard = document.getElementById('customDurationCard');
const customMinutes   = document.getElementById('customMinutes');
const setCustomBtn    = document.getElementById('setCustomBtn');

// Events
const addEventBtn    = document.getElementById('addEventBtn');
const eventForm      = document.getElementById('eventForm');
const eventTitle     = document.getElementById('eventTitle');
const eventDate      = document.getElementById('eventDate');
const eventType      = document.getElementById('eventType');
const saveEventBtn   = document.getElementById('saveEventBtn');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const eventsList     = document.getElementById('eventsList');
const totalEventsEl  = document.getElementById('totalEvents');
const upcomingCountEl= document.getElementById('upcomingCount');

// Toast
const toast = document.getElementById('toast');

/* ══════════════════════════════════════════════════════
   §3. UTILITY FUNCTIONS
   ══════════════════════════════════════════════════════ */

/**
 * Display a toast notification.
 * @param {string} msg  - message text
 * @param {'success'|'error'|'info'} type - visual style
 * @param {number} [duration=3000] - ms to show
 */
function showToast(msg, type = 'info', duration = 3000) {
  toast.textContent = msg;
  toast.className = `toast toast--${type} show`;
  clearTimeout(toast._timeoutId);
  toast._timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/** Format a Date object as "Day, DD Mon YYYY" */
function formatDateDisplay(d) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format seconds as MM:SS */
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Get today midnight for date comparisons */
function todayMidnight() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}

/** Days until a given date string (YYYY-MM-DD) */
function daysUntil(dateStr) {
  const target = new Date(dateStr + 'T00:00:00');
  const diff = target - todayMidnight();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/* ══════════════════════════════════════════════════════
   §4. LIVE DATE IN NAVBAR
   ══════════════════════════════════════════════════════ */
function updateDateDisplay() {
  currentDate.textContent = formatDateDisplay(new Date());
}
updateDateDisplay();
setInterval(updateDateDisplay, 60_000);

/* ══════════════════════════════════════════════════════
   §5. NAVIGATION / SECTION SWITCHER
   ══════════════════════════════════════════════════════ */
function switchSection(target) {
  const isGpa = target === 'gpa';

  navGpa.classList.toggle('active', isGpa);
  navTimer.classList.toggle('active', !isGpa);

  navGpa.setAttribute('aria-selected', isGpa ? 'true' : 'false');
  navTimer.setAttribute('aria-selected', isGpa ? 'false' : 'true');

  sectionGpa.style.display   = isGpa ? '' : 'none';
  sectionTimer.style.display = isGpa ? 'none' : '';

  // Re-trigger animation
  const activeSection = isGpa ? sectionGpa : sectionTimer;
  activeSection.classList.remove('active');
  void activeSection.offsetWidth; // reflow
  activeSection.classList.add('active');

  // Close mobile menu
  navLinks.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
}

navGpa.addEventListener('click', () => switchSection('gpa'));
navTimer.addEventListener('click', () => switchSection('timer'));

// Hamburger toggle
hamburgerBtn.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
});

/* ══════════════════════════════════════════════════════
   §6. GPA CALCULATOR
   ══════════════════════════════════════════════════════ */

/** State stored in localStorage */
const GPA_STORAGE_KEY = 'studentToolkit_gpaData';

/** Loaded once, mutated throughout session */
let gpaRows = [];

/** Build grade text-input HTML string */
function buildGradeInput(selectedGrade = 'A') {
  return `<input type="text" class="table-input" data-field="grade"
    value="${escapeHtml(selectedGrade)}" placeholder="A, B+, C-…"
    aria-label="Grade" maxlength="2" />`;
}

/** Create a new row object */
function createRowData(id, name = '', grade = 'A', credits = 3) {
  return { id, name, grade, credits };
}

/** Compute grade points for a row */
function computeGradePoints(grade, credits) {
  const points = GRADE_POINTS[grade] ?? 0;
  return +(points * credits).toFixed(2);
}

/** Render all rows into the table body */
function renderGpaTable() {
  gpaTableBody.innerHTML = '';

  if (gpaRows.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.85rem;">
        No courses added yet. Click "Add Course" to get started!
      </td>`;
    gpaTableBody.appendChild(emptyRow);
    return;
  }

  gpaRows.forEach((row, index) => {
    const gp = computeGradePoints(row.grade, row.credits);
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;
    tr.innerHTML = `
      <td>
        <input type="text" class="table-input" data-field="name"
          value="${escapeHtml(row.name)}" placeholder="e.g. Calculus II" maxlength="60"
          aria-label="Subject name for row ${index + 1}" />
      </td>
      <td style="width:120px;">
        ${buildGradeInput(row.grade)}
      </td>
      <td style="width:130px;">
        <input type="text" class="table-input" data-field="credits"
          value="${row.credits}" placeholder="e.g. 3"
          aria-label="Credit hours for row ${index + 1}" style="max-width:90px;"/>
      </td>
      <td class="grade-points-cell">${gp.toFixed(2)}</td>
      <td style="text-align:center;">
        <button class="btn-delete-row" data-id="${row.id}" aria-label="Delete course row ${index + 1}">
          ✕
        </button>
      </td>
    `;
    gpaTableBody.appendChild(tr);
  });

  attachTableListeners();
  updateGpaSummary();
  saveGpaToStorage();
}

/** Attach change/input listeners for each row */
function attachTableListeners() {
  gpaTableBody.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', handleTableFieldChange);
    if (el.type === 'text') el.addEventListener('input', handleTableFieldChange);
  });

  gpaTableBody.querySelectorAll('.btn-delete-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      gpaRows = gpaRows.filter(r => r.id !== id);
      renderGpaTable();
      showToast('Course removed.', 'info');
    });
  });
}

function handleTableFieldChange(e) {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const rowId = parseInt(tr.dataset.id, 10);
  const row = gpaRows.find(r => r.id === rowId);
  if (!row) return;

  const field = e.target.dataset.field;
  if (field === 'name')    row.name    = e.target.value.trim();
  if (field === 'grade') {
    // Normalize: uppercase and trim (A, B+, C-, etc.)
    const raw = e.target.value.trim().toUpperCase();
    // Accept both hyphen-minus and real minus sign
    const normalized = raw.replace('\u2212', '-');
    row.grade = normalized;  // keep whatever user typed; points fall to 0 if unrecognized
    e.target.value = normalized; // reflect normalization back into the field
  }
  if (field === 'credits') row.credits = parseFloat(e.target.value) || 0;

  // Update grade points cell in-place
  const gp = computeGradePoints(row.grade, row.credits);
  const gpCell = tr.querySelector('.grade-points-cell');
  if (gpCell) gpCell.textContent = gp.toFixed(2);

  updateGpaSummary();
  saveGpaToStorage();
}

/** Recalculate and display GPA summary */
function updateGpaSummary() {
  let totalCred = 0, totalQP = 0;

  gpaRows.forEach(row => {
    const credits = parseFloat(row.credits) || 0;
    const gp = computeGradePoints(row.grade, credits);
    totalCred += credits;
    totalQP += gp;
  });

  totalCredits.textContent  = totalCred % 1 === 0 ? totalCred : totalCred.toFixed(1);
  qualityPoints.textContent = totalQP.toFixed(2);

  if (totalCred > 0) {
    const gpa = totalQP / totalCred;
    const gpaStr = gpa.toFixed(2);
    gpaResult.textContent  = gpaStr;
    gpaDisplay.textContent = gpaStr;
    gpaDisplay.style.color = gpaColor(gpa);
  } else {
    gpaResult.textContent  = '—';
    gpaDisplay.textContent = '—';
    gpaDisplay.style.color = '';
  }
}

/** Get a color based on GPA value */
function gpaColor(gpa) {
  if (gpa >= 3.7) return 'var(--clr-success)';
  if (gpa >= 3.0) return 'var(--clr-primary-light)';
  if (gpa >= 2.0) return 'var(--clr-warn)';
  return 'var(--clr-danger)';
}

/** Add a new blank row */
let nextRowId = 1;
function addGpaRow(name = '', grade = 'A', credits = 3) {
  const row = createRowData(nextRowId++, name, grade, credits);
  gpaRows.push(row);
  renderGpaTable();
}

/** Clear all rows */
function clearAllRows() {
  if (gpaRows.length === 0) return;
  if (!confirm('Clear all courses? This cannot be undone.')) return;
  gpaRows = [];
  renderGpaTable();
  showToast('All courses cleared.', 'info');
}

/** Persist to localStorage */
function saveGpaToStorage() {
  try {
    localStorage.setItem(GPA_STORAGE_KEY, JSON.stringify({ rows: gpaRows, nextRowId }));
  } catch (_) {}
}

/** Load from localStorage */
function loadGpaFromStorage() {
  try {
    const raw = localStorage.getItem(GPA_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.rows)) {
      gpaRows = data.rows;
      nextRowId = data.nextRowId || (gpaRows.length + 1);
    }
  } catch (_) {
    gpaRows = [];
  }
}

/** Escape HTML to prevent XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* GPA Event Listeners */
addRowBtn.addEventListener('click', () => {
  addGpaRow();
  showToast('Course added!', 'success');
  // Scroll to last row
  setTimeout(() => {
    const rows = gpaTableBody.querySelectorAll('tr');
    if (rows.length) rows[rows.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 50);
});

calculateBtn.addEventListener('click', () => {
  updateGpaSummary();
  const gpaVal = gpaResult.textContent;
  const msg = gpaVal === '—'
    ? 'Add courses with credit hours to calculate GPA!'
    : `Your weighted GPA is ${gpaVal} / 4.0`;
  showToast(msg, gpaVal === '—' ? 'error' : 'success', 4000);

  // Pulse the GPA badge
  const badge = document.getElementById('gpaBadge');
  badge.style.transform = 'scale(1.06)';
  badge.style.boxShadow = '0 0 30px var(--clr-primary-light)';
  setTimeout(() => {
    badge.style.transform = '';
    badge.style.boxShadow = '';
  }, 600);
});

clearAllBtn.addEventListener('click', clearAllRows);

/* Initialize GPA section */
loadGpaFromStorage();
if (gpaRows.length === 0) {
  // Add default starter rows
  addGpaRow('Introduction to Computer Science', 'A', 3);
  addGpaRow('Calculus I', 'B+', 4);
  addGpaRow('English Composition', 'A-', 3);
} else {
  // Rebuild from storage
  nextRowId = Math.max(...gpaRows.map(r => r.id), 0) + 1;
  renderGpaTable();
}

/* ══════════════════════════════════════════════════════
   §7. POMODORO STUDY TIMER
   ══════════════════════════════════════════════════════ */

const TIMER_STORAGE_KEY = 'studentToolkit_timerData';

const MODES = {
  pomodoro:  { name: 'Focus Time',   minutes: 25, dotClass: 'log-dot--focus' },
  short:     { name: 'Short Break',  minutes: 5,  dotClass: 'log-dot--break' },
  long:      { name: 'Long Break',   minutes: 15, dotClass: 'log-dot--break' },
  custom:    { name: 'Custom Timer', minutes: 30, dotClass: 'log-dot--custom' },
};

// Ring circumference: 2 * π * r = 2 * π * 95 ≈ 597
const RING_CIRCUMFERENCE = 2 * Math.PI * 95;

ringProgress.style.strokeDasharray = RING_CIRCUMFERENCE;

let timerState = {
  mode: 'pomodoro',
  totalSeconds: 25 * 60,
  secondsLeft: 25 * 60,
  isRunning: false,
  intervalId: null,
  sessionCount: 0,
  sessionsLog: [],     // array of { mode, duration, time }
};

/** Load persisted timer state */
function loadTimerFromStorage() {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    timerState.sessionCount = saved.sessionCount || 0;
    timerState.sessionsLog   = saved.sessionsLog || [];
    // Don't restore mid-session state — always start fresh
  } catch (_) {}
}

/** Save timer state to storage */
function saveTimerToStorage() {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
      sessionCount: timerState.sessionCount,
      sessionsLog: timerState.sessionsLog.slice(-50) // limit log size
    }));
  } catch (_) {}
}

/** Set timer to a given mode */
function setTimerMode(modeName) {
  if (timerState.isRunning) pauseTimer();

  timerState.mode = modeName;
  const cfg = MODES[modeName];
  timerState.totalSeconds  = cfg.minutes * 60;
  timerState.secondsLeft   = cfg.minutes * 60;

  timerModeName.textContent = cfg.name;
  updateTimerDisplay();
  updateRing();
  updateProgressBar();

  // Update mode buttons
  modeButtons.forEach(btn => {
    const isActive = btn.dataset.mode === modeName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  // Show/hide custom card
  customDurationCard.style.display = modeName === 'custom' ? '' : 'none';
}

/** Update the digital clock display */
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timerState.secondsLeft);
  document.title = timerState.isRunning
    ? `${formatTime(timerState.secondsLeft)} — ${MODES[timerState.mode].name}`
    : 'Student Toolkit';
}

/** Update the SVG ring */
function updateRing() {
  const fraction = timerState.secondsLeft / timerState.totalSeconds;
  const offset   = RING_CIRCUMFERENCE * (1 - fraction);
  ringProgress.style.strokeDashoffset = offset;
}

/** Update the linear progress bar */
function updateProgressBar() {
  const pct = (timerState.secondsLeft / timerState.totalSeconds) * 100;
  progressBarFill.style.width = `${pct}%`;
}

/** Start the timer countdown */
function startTimer() {
  if (timerState.isRunning) return;
  timerState.isRunning = true;

  playIcon.style.display  = 'none';
  pauseIcon.style.display = '';
  startPauseBtn.setAttribute('aria-label', 'Pause timer');
  startPauseBtn.classList.add('running');

  timerState.intervalId = setInterval(() => {
    if (timerState.secondsLeft <= 0) {
      clearInterval(timerState.intervalId);
      timerState.isRunning = false;
      onTimerComplete();
      return;
    }
    timerState.secondsLeft--;
    updateTimerDisplay();
    updateRing();
    updateProgressBar();
  }, 1000);
}

/** Pause the timer */
function pauseTimer() {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;

  playIcon.style.display  = '';
  pauseIcon.style.display = 'none';
  startPauseBtn.setAttribute('aria-label', 'Start timer');
  startPauseBtn.classList.remove('running');
  document.title = 'Student Toolkit';
}

/** Reset the timer */
function resetTimer() {
  pauseTimer();
  timerState.secondsLeft = timerState.totalSeconds;
  updateTimerDisplay();
  updateRing();
  updateProgressBar();
}

/** Called when a session completes */
function onTimerComplete() {
  playIcon.style.display  = '';
  pauseIcon.style.display = 'none';
  startPauseBtn.setAttribute('aria-label', 'Start timer');
  startPauseBtn.classList.remove('running');

  const mode = timerState.mode;
  const cfg  = MODES[mode];

  // Increment session count for focus sessions
  if (mode === 'pomodoro' || mode === 'custom') {
    timerState.sessionCount++;
    sessionsToday.textContent = timerState.sessionCount;
  }

  // Log the session
  const now = new Date();
  const logEntry = {
    mode,
    label: cfg.name,
    duration: cfg.minutes,
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  timerState.sessionsLog.unshift(logEntry);
  saveTimerToStorage();
  renderSessionLog();

  // Notify user
  const msg = mode === 'pomodoro'
    ? `🍅 Pomodoro complete! Take a short break. (Session #${timerState.sessionCount})`
    : `✅ Break over! Time to focus.`;
  showToast(msg, 'success', 5000);

  // 🔔 Play the completion ding via Web Audio API
  playDingSound();

  // Browser notification if permitted
  if (Notification.permission === 'granted') {
    new Notification('Student Toolkit', { body: msg, icon: '' });
  }

  // Flash the timer display
  timerDisplay.style.color = 'var(--clr-accent)';
  setTimeout(() => { timerDisplay.style.color = ''; }, 1000);

  // Reset for next round
  timerState.secondsLeft = timerState.totalSeconds;
  updateTimerDisplay();
  updateRing();
  updateProgressBar();
  document.title = 'Student Toolkit';
}

/** Render session log list */
function renderSessionLog() {
  const logs = timerState.sessionsLog;
  if (logs.length === 0) {
    sessionLog.innerHTML = `<li class="session-log__empty">No sessions recorded yet. Start your first Pomodoro!</li>`;
    return;
  }

  sessionLog.innerHTML = logs.map((entry, i) => `
    <li>
      <span class="log-dot ${MODES[entry.mode]?.dotClass || 'log-dot--focus'}"></span>
      <span style="flex:1;">${entry.label}</span>
      <span style="color:var(--text-muted);font-size:0.78rem;">${entry.duration} min</span>
      <span style="color:var(--text-muted);font-size:0.75rem;margin-left:0.5rem;">${entry.time}</span>
    </li>
  `).join('');
}

/* Timer Button Listeners */
startPauseBtn.addEventListener('click', () => {
  if (timerState.isRunning) pauseTimer();
  else {
    // Request notification permission on first start
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    startTimer();
  }
});

resetBtn.addEventListener('click', () => {
  resetTimer();
  showToast('Timer reset.', 'info');
});

skipBtn.addEventListener('click', () => {
  pauseTimer();
  // Cycle modes: pomodoro → short → long → pomodoro
  const cycle = ['pomodoro', 'short', 'long'];
  const currentIdx = cycle.indexOf(timerState.mode);
  const nextMode = cycle[(currentIdx + 1) % cycle.length];
  setTimerMode(nextMode);
  showToast(`Switched to ${MODES[nextMode].name}.`, 'info');
});

/* Mode button listeners */
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setTimerMode(btn.dataset.mode);
  });
});

/* Custom timer */
setCustomBtn.addEventListener('click', () => {
  const mins = parseInt(customMinutes.value, 10);
  if (isNaN(mins) || mins < 1 || mins > 120) {
    showToast('Please enter a duration between 1 and 120 minutes.', 'error');
    return;
  }
  MODES.custom.minutes = mins;
  timerState.totalSeconds  = mins * 60;
  timerState.secondsLeft   = mins * 60;
  updateTimerDisplay();
  updateRing();
  updateProgressBar();
  showToast(`Custom timer set to ${mins} minutes!`, 'success');
});

clearLogBtn.addEventListener('click', () => {
  timerState.sessionsLog = [];
  timerState.sessionCount = 0;
  sessionsToday.textContent = '0';
  saveTimerToStorage();
  renderSessionLog();
  showToast('Session log cleared.', 'info');
});

/* Initialize timer */
loadTimerFromStorage();
sessionsToday.textContent = timerState.sessionCount;
setTimerMode('pomodoro');
renderSessionLog();

/* ══════════════════════════════════════════════════════
   §7b. WEB AUDIO API — COMPLETION DING
   Synthesizes a pleasant triple-chime with no external files.
   ══════════════════════════════════════════════════════ */

/** Shared AudioContext — lazily created on first use */
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

/**
 * Play a single sine-wave tone.
 * @param {AudioContext} ctx
 * @param {number} freq      - frequency in Hz
 * @param {number} startTime - AudioContext time to begin
 * @param {number} duration  - seconds
 * @param {number} gain      - peak volume (0–1)
 */
function playTone(ctx, freq, startTime, duration, gain = 0.4) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.connect(env);
  env.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  // Attack → sustain → release envelope
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(gain, startTime + 0.02);      // fast attack
  env.gain.setValueAtTime(gain, startTime + duration * 0.6);      // sustain
  env.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // decay

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/**
 * Play a pleasant three-note chime (C5 → E5 → G5).
 * The three notes are staggered 0.28 s apart.
 */
function playDingSound() {
  try {
    const ctx   = getAudioCtx();
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();

    const now   = ctx.currentTime;
    const notes = [
      { freq: 523.25, offset: 0.00, dur: 0.8 },   // C5
      { freq: 659.25, offset: 0.28, dur: 0.7 },   // E5
      { freq: 783.99, offset: 0.56, dur: 1.0 },   // G5
    ];

    notes.forEach(({ freq, offset, dur }) => {
      playTone(ctx, freq, now + offset, dur, 0.32);
    });
  } catch (err) {
    // Silently swallow — audio is a non-critical enhancement
    console.warn('Audio playback failed:', err);
  }
}

/* ══════════════════════════════════════════════════════
   §8. UPCOMING EVENTS MANAGER
   ══════════════════════════════════════════════════════ */

const EVENTS_STORAGE_KEY = 'studentToolkit_events';

const EVENT_EMOJIS = {
  exam:       '📝',
  assignment: '📋',
  deadline:   '⚠️',
  class:      '🎓',
};

/**
 * Detect an emoji from a free-text event type string.
 * Falls back to 📌 if no keyword matched.
 */
function getEventEmoji(typeStr) {
  const t = (typeStr || '').toLowerCase();
  if (t.includes('exam') || t.includes('test') || t.includes('quiz') || t.includes('midterm') || t.includes('final')) return '📝';
  if (t.includes('assign') || t.includes('homework') || t.includes('hw') || t.includes('problem set')) return '📋';
  if (t.includes('deadline') || t.includes('due') || t.includes('submit')) return '⚠️';
  if (t.includes('class') || t.includes('lecture') || t.includes('seminar') || t.includes('lab')) return '🎓';
  if (t.includes('meeting') || t.includes('office hour')) return '🤝';
  if (t.includes('project')) return '📦';
  return '📌'; // generic pin
}

let events = [];
let nextEventId = 1;

/** Load events from localStorage */
function loadEventsFromStorage() {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    events = data.events || [];
    nextEventId = data.nextEventId || (events.length + 1);
  } catch (_) { events = []; }
}

/** Save events to localStorage */
function saveEventsToStorage() {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify({ events, nextEventId }));
  } catch (_) {}
}

/** Render the events list in the sidebar */
function renderEventsList() {
  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sorted.length === 0) {
    eventsList.innerHTML = `
      <li class="events-list__empty">
        📭 No upcoming events<br/>Click <strong>+</strong> to add your first one!
      </li>`;
    updateEventStats(0, 0);
    return;
  }

  eventsList.innerHTML = '';
  const now = todayMidnight();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  let thisWeekCount = 0;

  sorted.forEach(ev => {
    const days = daysUntil(ev.date);
    let badgeClass = 'badge--ok';
    let badgeText  = `${days}d`;
    if (days < 0) {
      badgeText = 'Past';
      badgeClass = '';
    } else if (days === 0) {
      badgeText = 'Today!';
      badgeClass = 'badge--urgent';
    } else if (days <= 2) {
      badgeText = `${days}d`;
      badgeClass = 'badge--urgent';
    } else if (days <= 7) {
      badgeText = `${days}d`;
      badgeClass = 'badge--soon';
      thisWeekCount++;
    } else {
      thisWeekCount += (days <= 7) ? 1 : 0;
    }

    const targetDate = new Date(ev.date + 'T00:00:00');
    if (targetDate >= now && targetDate - now <= oneWeekMs) thisWeekCount++;

    const liEl = document.createElement('li');
    liEl.className = 'event-item';
    liEl.dataset.id = ev.id;
    liEl.innerHTML = `
      <span class="event-item__emoji">${getEventEmoji(ev.type)}</span>
      <div class="event-item__body">
        <div class="event-item__title">${escapeHtml(ev.title)}</div>
        <div class="event-item__date">${formatEventDate(ev.date)}</div>
      </div>
      <span class="event-item__badge ${badgeClass}">${badgeText}</span>
      <button class="event-item__delete" data-id="${ev.id}" aria-label="Delete event: ${escapeHtml(ev.title)}">✕</button>
    `;
    eventsList.appendChild(liEl);
  });

  // Delete button listeners
  eventsList.querySelectorAll('.event-item__delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEvent(parseInt(btn.dataset.id, 10));
    });
  });

  updateEventStats(events.length, thisWeekCount);
}

/** Format event date as "Mon DD" */
function formatEventDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Update sidebar stat counters */
function updateEventStats(total, thisWeek) {
  totalEventsEl.textContent   = total;
  upcomingCountEl.textContent = thisWeek;
}

/** Delete an event by ID */
function deleteEvent(id) {
  events = events.filter(e => e.id !== id);
  saveEventsToStorage();
  renderEventsList();
  showToast('Event removed.', 'info');
}

/* Events form toggle */
addEventBtn.addEventListener('click', () => {
  const isVisible = eventForm.style.display !== 'none';
  eventForm.style.display = isVisible ? 'none' : '';
  if (!isVisible) {
    // Set default date text to tomorrow in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y  = tomorrow.getFullYear();
    const m  = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d  = String(tomorrow.getDate()).padStart(2, '0');
    eventDate.value = `${y}-${m}-${d}`;
    eventTitle.focus();
  }
});

cancelEventBtn.addEventListener('click', () => {
  eventForm.style.display = 'none';
  eventTitle.value = '';
});

saveEventBtn.addEventListener('click', () => {
  const title = eventTitle.value.trim();
  const date  = eventDate.value.trim();
  const type  = eventType.value.trim() || 'general';

  if (!title) {
    showToast('Please enter an event title.', 'error');
    eventTitle.focus();
    return;
  }
  if (!date) {
    showToast('Please enter a date (YYYY-MM-DD).', 'error');
    eventDate.focus();
    return;
  }
  // Validate that the date string looks like YYYY-MM-DD and is parseable
  const parsedDate = new Date(date + 'T00:00:00');
  if (isNaN(parsedDate.getTime())) {
    showToast('Invalid date. Use format: YYYY-MM-DD (e.g. 2026-04-20)', 'error');
    eventDate.focus();
    return;
  }

  events.push({ id: nextEventId++, title, date, type });
  saveEventsToStorage();
  renderEventsList();
  showToast('Event added! 🎉', 'success');

  // Reset form
  eventTitle.value = '';
  eventDate.value  = '';
  eventType.value  = '';
  eventForm.style.display = 'none';
});

/* Allow Enter key to save event */
eventTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveEventBtn.click();
});

/** Seed sample events for first-time users */
function seedSampleEvents() {
  const today = new Date();
  const addDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  };

  events = [
    { id: nextEventId++, title: 'Midterm: Calculus I',              date: addDays(5),  type: 'exam'       },
    { id: nextEventId++, title: 'Physics Lab Report Due',           date: addDays(10), type: 'assignment' },
    { id: nextEventId++, title: 'CS Project Submission',            date: addDays(18), type: 'deadline'   },
  ];
}

/* Initialize events */
loadEventsFromStorage();
if (events.length === 0) {
  seedSampleEvents();
  saveEventsToStorage();
}
renderEventsList();

/* ══════════════════════════════════════════════════════
   §9. KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  // Space to start/pause timer when timer section is visible
  if (e.code === 'Space' && sectionTimer.style.display !== 'none') {
    const active = document.activeElement;
    const isInput = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA';
    if (!isInput) {
      e.preventDefault();
      startPauseBtn.click();
    }
  }

  // Ctrl+G → GPA section
  if (e.ctrlKey && e.key === 'g') {
    e.preventDefault();
    switchSection('gpa');
  }

  // Ctrl+T → Timer section
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    switchSection('timer');
  }
});

/* ══════════════════════════════════════════════════════
   §10. GLOBAL DARK / LIGHT MODE TOGGLE
   Mechanism: toggling body.light-theme class.
   All colors come from CSS variables — zero JS color logic.
   ══════════════════════════════════════════════════════ */

const THEME_KEY = 'studentToolkit_theme';

/** Apply either 'dark' or 'light' theme */
function applyTheme(mode) {
  const isLight = mode === 'light';

  document.body.classList.toggle('light-theme', isLight);

  // Sync the toggle UI
  themeCheckbox.checked = isLight;
  themeCheckbox.setAttribute('aria-checked', String(isLight));
  themeLabel.textContent = isLight ? 'Light' : 'Dark';

  // Persist preference
  try { localStorage.setItem(THEME_KEY, mode); } catch (_) {}
}

/** Toggle between dark and light */
function toggleTheme() {
  const currentlyLight = document.body.classList.contains('light-theme');
  applyTheme(currentlyLight ? 'dark' : 'light');
  showToast(
    document.body.classList.contains('light-theme')
      ? '☀️ Switched to Light Mode'
      : '🌙 Switched to Dark Mode',
    'info', 2000
  );
}

// Event listener — clicking the track label or checkbox both fire this
themeCheckbox.addEventListener('change', toggleTheme);

// Load saved preference on startup
(function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved === 'light' ? 'light' : 'dark'); // default: dark
  } catch (_) {
    applyTheme('dark');
  }
})();

/* ══════════════════════════════════════════════════════
   §11. KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  // Space to start/pause timer when timer section is visible
  if (e.code === 'Space' && sectionTimer.style.display !== 'none') {
    const active = document.activeElement;
    const isInput = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA';
    if (!isInput) {
      e.preventDefault();
      startPauseBtn.click();
    }
  }

  // Ctrl+G → GPA section
  if (e.ctrlKey && e.key === 'g') {
    e.preventDefault();
    switchSection('gpa');
  }

  // Ctrl+T → Timer section
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    switchSection('timer');
  }

  // Ctrl+D → toggle dark/light mode
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    toggleTheme();
  }
});

/* ══════════════════════════════════════════════════════
   §12. FINAL INITIALIZATION TOAST
   ══════════════════════════════════════════════════════ */
setTimeout(() => {
  showToast('👋 Welcome to Student Toolkit! Ctrl+G = GPA │ Ctrl+T = Timer │ Ctrl+D = Dark/Light', 'info', 6000);
}, 800);
