// ─── Teacher Dashboard ────────────────────────────────────────────────────────
// Analytics categories:
//   1. Progress & Completion       → Challenge Progress section
//   2. Accuracy & Achievement      → Skills matrix + quick stats
//   3. Concept-Level Understanding → Hardest Exercises + Category Pass Rates
//   4. Code Behaviour & CT Metrics → Construct & Error charts
//   5. Time & Engagement           → Activity chart + Engagement table
//   6. Help & Support              → Feedback Summary card
//   7. Attempt Patterns/Resilience → At-Risk Students card
//   8. Comparative/Cohort          → Student Details table + sidebar
//   9. Assessment & Exam Readiness → Exam Readiness table
//  10. Teacher-Focused Meta        → Hardest exercises + Revalidate tool

import {
  getAllStudents, getSessions, aggregateAnalytics,
  getAllChallengeProgress, getAllTeacherFeedback, saveTeacherFeedback,
  getClassNames, saveClassName, saveChallengeProgress, updateLeaderboard
} from './storage.js';
import { EXERCISES, CATEGORIES } from './exercises.js';
import { highlightSource } from './editor.js';
import { Interpreter } from './interpreter.js';
import { checkUndeclaredVariables } from './challenges.js';

const PALETTE = {
  teal:      '#00809D',
  tealLight: '#4EC9E0',
  gold:      '#FFD700',
  goldDark:  '#D3AF37',
  success:   '#50C080',
  warn:      '#E09050',
  error:     '#C05050',
  bg:        '#141c26',
  surface:   '#1a2535',
  text:      '#e8f4f8',
  muted:     '#6a8a98'
};

const CONCEPT_MAP = {
  basics:     { label: 'Variables & I/O',            short: 'Basics',     desc: 'Declaration, assignment, input/output, data types' },
  operators:  { label: 'Operators & Expressions',     short: 'Operators',  desc: 'Arithmetic, comparison and logical operators' },
  selection:  { label: 'Selection (IF/CASE)',          short: 'Selection',  desc: 'Conditional logic and decision-making constructs' },
  iteration:  { label: 'Iteration (Loops)',            short: 'Iteration',  desc: 'FOR, WHILE and REPEAT…UNTIL loops' },
  library:    { label: 'String & Library Functions',   short: 'Library',    desc: 'String manipulation and built-in library routines' },
  procedures: { label: 'Modular Design',               short: 'Procedures', desc: 'Procedures, functions, parameters and return values' },
  arrays:     { label: 'Arrays',                       short: 'Arrays',     desc: 'Array declaration, traversal and manipulation' },
  files:      { label: 'File Handling',                short: 'Files',      desc: 'OPENFILE, READFILE, WRITEFILE, CLOSEFILE' },
  algorithms: { label: 'Standard Algorithms',          short: 'Algorithms', desc: 'Linear/binary search, bubble sort, validation' },
  exam:       { label: 'Exam Questions',               short: 'Exam',       desc: 'Integrated exam-style problem solving' },
};

// Core topic categories used for exam readiness calculation
const CORE_CATEGORIES = ['basics', 'operators', 'selection', 'iteration'];

// Module-level cache — not re-fetched when class filter changes
let _students    = null;
let _sessions    = null;
let _allProgress = null;   // { uid: { completed, submissions, totalXP, ... } }
let _feedback    = null;   // { uid: { exId: comment } }
let _classNames  = {};     // { classCode: friendlyName }
let _containerEl = null;   // stored so refreshDashboard() can re-render without re-fetching

/** Re-render from in-memory cache (no Firestore reads). Call after revalidation. */
export function refreshDashboard() {
  if (_containerEl && _students) _render(_containerEl, null);
}

export async function renderDashboard(containerEl) {
  _containerEl = containerEl;
  containerEl.innerHTML = '<p class="dash-loading">Loading dashboard…</p>';
  try {
    [_students, _sessions, _allProgress] = await Promise.all([
      getAllStudents(),
      getSessions(),
      getAllChallengeProgress()
    ]);
    [_feedback, _classNames] = await Promise.all([
      getAllTeacherFeedback().catch(() => ({})),
      getClassNames().catch(() => ({}))
    ]);
  } catch (e) {
    containerEl.innerHTML = `<p class="dash-error">Failed to load: ${e.message}</p>`;
    return;
  }
  _render(containerEl, null);
}

function _render(containerEl, selectedClass) {
  const students = selectedClass
    ? _students.filter(s => s.classCode === selectedClass)
    : _students;
  const uids = new Set(students.map(s => s.uid));
  const sessions = selectedClass
    ? _sessions.filter(s => uids.has(s.uid))
    : _sessions;

  const analytics  = aggregateAnalytics(sessions, students);
  const classCodes = [...new Set(_students.map(s => s.classCode).filter(Boolean))].sort();
  const uidArr     = [...uids];

  containerEl.innerHTML = _buildHTML(analytics, sessions, classCodes, selectedClass, uidArr, students);

  // Class tab switching
  containerEl.querySelectorAll('.dash-class-tab').forEach(btn => {
    btn.addEventListener('click', e => {
      if (e.target.closest('.dash-class-rename')) return;
      _render(containerEl, btn.dataset.class || null);
    });
  });

  // Class rename
  containerEl.querySelectorAll('.dash-class-rename').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const code    = btn.dataset.rename;
      const current = _classNames[code] ?? code;
      const newName = window.prompt(`Rename class "${current}" to:`, current);
      if (!newName || newName.trim() === current) return;
      saveClassName(code, newName.trim())
        .then(() => { _classNames[code] = newName.trim(); _render(containerEl, selectedClass); })
        .catch(err => alert(`Could not save class name: ${err.message}`));
    });
  });

  requestAnimationFrame(() => {
    _renderConstructChart(sessions);
    _renderErrorChart(sessions);
    _renderActivityChart(sessions, 30);
    _buildChallengeOverview(containerEl, students, uidArr);
    _bindStudentTable(containerEl);

    // Activity range buttons
    containerEl.querySelectorAll('.dash-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        containerEl.querySelectorAll('.dash-range-btn').forEach(b => b.classList.remove('dash-range-btn--active'));
        btn.classList.add('dash-range-btn--active');
        _renderActivityChart(sessions, parseInt(btn.dataset.days, 10));
      });
    });

    // Revalidate button
    const revalBtn    = containerEl.querySelector('#btn-revalidate');
    const revalStatus = containerEl.querySelector('#revalidate-status');
    if (revalBtn) {
      revalBtn.addEventListener('click', async () => {
        revalBtn.disabled    = true;
        revalBtn.textContent = 'Revalidating…';
        if (revalStatus) revalStatus.textContent = 'Checking submissions…';
        try {
          const invalidated = await revalidateAllSubmissions(revalStatus);
          if (revalStatus) revalStatus.textContent =
            `Done — ${invalidated} submission${invalidated !== 1 ? 's' : ''} invalidated.`;
          if (invalidated > 0) setTimeout(() => _render(containerEl, selectedClass), 1200);
        } catch (err) {
          if (revalStatus) revalStatus.textContent = `Error: ${err.message}`;
        } finally {
          revalBtn.disabled    = false;
          revalBtn.textContent = 'Revalidate All';
        }
      });
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// HTML SKELETON
// ══════════════════════════════════════════════════════════════════════════════

function _buildHTML(analytics, sessions, classCodes, selectedClass, uids, students) {
  // ── Quick-stat computations ─────────────────────────────────────────────────
  const totalStudents  = analytics.length;
  const activeLast7    = _countActive(sessions, 7);
  const activeLast30   = _countActive(sessions, 30);

  let totalCompleted = 0, totalAttempted = 0;
  for (const uid of uids) {
    const prog = _allProgress?.[uid];
    for (const ex of EXERCISES) {
      if (prog?.submissions?.[ex.id]) totalAttempted++;
      if (prog?.completed?.[ex.id]) totalCompleted++;
    }
  }
  const classPassRate = totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : 0;

  const readyThreshold  = Math.ceil(EXERCISES.length * 0.70);
  const examReadyCount  = uids.filter(uid => {
    const prog = _allProgress?.[uid];
    return EXERCISES.filter(e => prog?.completed?.[e.id]).length >= readyThreshold;
  }).length;

  // ── Filter bar ──────────────────────────────────────────────────────────────
  const filterHTML = classCodes.length > 0 ? `
    <div class="dash-filter-bar">
      <div class="dash-class-tabs">
        <button class="dash-class-tab ${!selectedClass ? 'dash-class-tab--active' : ''}" data-class="">
          All classes
        </button>
        ${classCodes.map(c => {
          const name  = _classNames[c] ?? c;
          const count = _students.filter(s => s.classCode === c).length;
          return `<button class="dash-class-tab ${c === selectedClass ? 'dash-class-tab--active' : ''}" data-class="${escHtml(c)}">
            ${escHtml(name)}
            <span class="dash-class-count">${count}</span>
            <span class="dash-class-rename" data-rename="${escHtml(c)}" title="Rename class">✎</span>
          </button>`;
        }).join('')}
      </div>
    </div>` : '';

  const classSuffix = selectedClass ? ` · ${escHtml(_classNames[selectedClass] ?? selectedClass)}` : '';

  return `
    ${filterHTML}
    <div class="dash-wrap">

    <!-- ═══ QUICK STATS ══════════════════════════════════════════════════════ -->
    <div class="dash-stats-row">
      ${_statCard(totalStudents,   `Students enrolled${classSuffix}`)}
      ${_statCard(activeLast7,     'Active last 7 days')}
      ${_statCard(activeLast30,    'Active last 30 days')}
      ${_statCard(totalCompleted,  'Total completions')}
      ${_statCard(classPassRate + '%', 'Class pass rate')}
      ${_statCard(examReadyCount,  'Exam-ready (70%+ done)')}
    </div>

    <!-- ═══ 1. PROGRESS & COMPLETION ════════════════════════════════════════ -->
    <div class="dash-section-hdr"><span class="dash-section-num">1</span> Progress &amp; Completion</div>
    <div class="dash-grid">
      <div class="dash-card span-4" id="ch-overview-card">
        <h3 class="dash-card-title">Challenge Progress by Topic</h3>
        <div id="ch-class-analysis"></div>
        <div class="ch-main-layout">
          <div class="ch-student-list-panel" id="ch-student-list"></div>
          <div class="ch-detail-panel" id="ch-detail-panel">
            <p class="ch-detail-hint">← Select a student to view their work and provide feedback.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 4. CODE BEHAVIOUR & CT METRICS ══════════════════════════════════ -->
    <div class="dash-section-hdr"><span class="dash-section-num">2</span> Code Behaviour &amp; CT Metrics</div>
    <div class="dash-grid">
      <div class="dash-card span-2">
        <h3 class="dash-card-title">Construct Accuracy</h3>
        <p class="dash-card-subtitle">% of sessions using each construct without errors</p>
        <canvas id="chart-constructs"></canvas>
      </div>
      <div class="dash-card span-2">
        <h3 class="dash-card-title">Error Distribution</h3>
        <p class="dash-card-subtitle">Most common error types across all sessions</p>
        <canvas id="chart-errors"></canvas>
      </div>
    </div>

    <!-- ═══ 3. CONCEPT-LEVEL UNDERSTANDING ══════════════════════════════════ -->
    <div class="dash-section-hdr"><span class="dash-section-num">3</span> Concept-Level Understanding</div>
    <div class="dash-grid">
      <div class="dash-card span-2">
        <h3 class="dash-card-title">Hardest Exercises</h3>
        <p class="dash-card-subtitle">Lowest pass rates where ≥2 students attempted</p>
        ${_buildHardestExercises(uids)}
      </div>
      <div class="dash-card span-2">
        <h3 class="dash-card-title">Category Pass Rates</h3>
        <p class="dash-card-subtitle">Attempts vs completions per topic across the class</p>
        ${_buildCategoryPassRates(uids)}
      </div>
    </div>

    <!-- ═══ 5. TIME & ENGAGEMENT ═════════════════════════════════════════════ -->
    <div class="dash-section-hdr"><span class="dash-section-num">4</span> Time &amp; Engagement</div>
    <div class="dash-grid">
      <div class="dash-card span-2">
        <div class="dash-card-title-row">
          <h3 class="dash-card-title">Daily Activity</h3>
          <div class="dash-activity-range">
            <button class="dash-range-btn dash-range-btn--active" data-days="30">30d</button>
            <button class="dash-range-btn" data-days="60">60d</button>
            <button class="dash-range-btn" data-days="90">90d</button>
            <button class="dash-range-btn" data-days="0">All</button>
          </div>
        </div>
        <p class="dash-card-subtitle">Number of coding sessions per day</p>
        <canvas id="chart-activity" height="200"></canvas>
      </div>
      <div class="dash-card span-2">
        <h3 class="dash-card-title">Engagement by Student</h3>
        <p class="dash-card-subtitle">Sessions, average duration, code volume and last active date</p>
        ${_buildEngagementTable(analytics, sessions)}
      </div>
    </div>

    <!-- ═══ 9. ASSESSMENT & EXAM READINESS ══════════════════════════════════ -->
    <div class="dash-section-hdr"><span class="dash-section-num">5</span> Assessment &amp; Exam Readiness</div>
    <div class="dash-grid">
      <div class="dash-card span-4">
        <h3 class="dash-card-title">Exam Readiness by Student</h3>
        <p class="dash-card-subtitle">Overall completion %, core topic mastery (${CORE_CATEGORIES.join(', ')}) and exam-category performance</p>
        ${_buildExamReadinessTable(students)}
      </div>
    </div>

    <!-- ═══ 2+8. ACCURACY & COHORT ANALYTICS ════════════════════════════════ -->
    <div class="dash-section-hdr"><span class="dash-section-num">6</span> Accuracy &amp; Cohort Analytics</div>
    <div class="dash-grid">
      <div class="dash-card span-4">
        <h3 class="dash-card-title">Class Skills Overview</h3>
        <p class="dash-card-subtitle">Algorithm design breadth, computational thinking, and pseudocode syntax accuracy per student</p>
        ${_buildSkillsMatrix(analytics)}
      </div>
    </div>

    <!-- ═══ 8. STUDENT DETAILS ═══════════════════════════════════════════════ -->
    <div class="dash-section-hdr"><span class="dash-section-num">7</span> Student Details</div>
    <div class="dash-grid">
      <div class="dash-card span-4 dash-split-card" id="student-details-card">
        <div class="dash-split-left">
          <h3 class="dash-card-title">All Students</h3>
          ${_buildStudentTable(analytics)}
        </div>
        <div class="dash-split-right" id="student-detail-side">
          <p class="ch-detail-hint">← Click a student row to see their analytics.</p>
        </div>
      </div>
    </div>

    <!-- ═══ 6+7+10. TEACHER TOOLS ════════════════════════════════════════════ -->
    <div class="dash-section-hdr"><span class="dash-section-num">8</span> Teacher Tools</div>
    <div class="dash-grid">
      <div class="dash-card span-2">
        <h3 class="dash-card-title">At-Risk &amp; Resilience</h3>
        <p class="dash-card-subtitle">Students who have attempted exercises but have a low completion rate</p>
        ${_buildAtRiskStudents(students)}
      </div>
      <div class="dash-card">
        <h3 class="dash-card-title">Help &amp; Support</h3>
        <p class="dash-card-subtitle">Teacher feedback coverage across the class</p>
        ${_buildFeedbackSummary(students)}
      </div>
      <div class="dash-card">
        <h3 class="dash-card-title">Revalidate Submissions</h3>
        <p class="dash-card-subtitle">Re-run tests after updating exercise criteria</p>
        <p class="dash-card-description">Removes completions that no longer pass current test cases. Use after changing exercise tests.</p>
        <button class="btn-primary" id="btn-revalidate">Revalidate All</button>
        <div id="revalidate-status" class="reval-status"></div>
      </div>
    </div>

    </div>`; // end .dash-wrap
}

// ══════════════════════════════════════════════════════════════════════════════
// QUICK STAT CARD HELPER
// ══════════════════════════════════════════════════════════════════════════════

function _statCard(value, label) {
  return `<div class="dash-card dash-stat-card">
    <div class="dash-stat">${value}</div>
    <div class="dash-label">${label}</div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// PER-EXERCISE STATS (used by both Hardest Exercises and Category Pass Rates)
// ══════════════════════════════════════════════════════════════════════════════

function _computeExerciseStats(uids) {
  return EXERCISES.map(ex => {
    let attempts = 0, passed = 0;
    for (const uid of uids) {
      const prog = _allProgress?.[uid];
      if (prog?.submissions?.[ex.id]) attempts++;
      if (prog?.completed?.[ex.id]) passed++;
    }
    const rate = attempts > 0 ? Math.round((passed / attempts) * 100) : null;
    return { id: ex.id, title: ex.title, category: ex.category, difficulty: ex.difficulty, attempts, passed, rate };
  });
}

// ── Hardest Exercises table ──────────────────────────────────────────────────

function _buildHardestExercises(uids) {
  const stats    = _computeExerciseStats(uids);
  const withData = stats
    .filter(s => s.attempts >= 2 && s.rate !== null)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 10);

  if (!withData.length) {
    return '<p class="dash-empty">Not enough data yet — need ≥2 students per exercise.</p>';
  }

  const rows = withData.map(s => {
    const rateCls = s.rate >= 70 ? 'rate-high' : s.rate >= 40 ? 'rate-mid' : 'rate-low';
    const diffCls = `diff-${s.difficulty}`;
    const cm      = CONCEPT_MAP[s.category];
    return `<tr>
      <td class="hard-ex-title">${escHtml(s.title)}</td>
      <td><span class="hard-cat-badge">${escHtml(cm?.short ?? s.category)}</span></td>
      <td><span class="ch-ex-diff ${diffCls}">${s.difficulty[0].toUpperCase()}</span></td>
      <td class="mono hard-count">${s.attempts}</td>
      <td><span class="rate-badge ${rateCls}">${s.rate}%</span></td>
    </tr>`;
  }).join('');

  return `<div class="table-scroll">
    <table class="dash-table">
      <thead>
        <tr>
          <th>Exercise</th><th>Topic</th><th>Diff</th>
          <th>Tried</th><th>Pass rate</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── Category Pass Rates ──────────────────────────────────────────────────────

function _buildCategoryPassRates(uids) {
  const rows = CATEGORIES.map(cat => {
    const exs = EXERCISES.filter(e => e.category === cat.id);
    let attempts = 0, passed = 0, activeStudents = 0;
    for (const uid of uids) {
      const prog = _allProgress?.[uid];
      const a = exs.filter(e => prog?.submissions?.[e.id]).length;
      const p = exs.filter(e => prog?.completed?.[e.id]).length;
      if (a > 0) { attempts += a; passed += p; activeStudents++; }
    }
    const rate = attempts > 0 ? Math.round((passed / attempts) * 100) : null;
    const cm   = CONCEPT_MAP[cat.id];

    if (!activeStudents) {
      return `<div class="cat-rate-row">
        <div class="cat-rate-name" title="${escHtml(cm?.label ?? cat.id)}">${escHtml(cm?.short ?? cat.id)}</div>
        <div class="cat-rate-bar-wrap"><div class="cat-rate-bar cat-bar-none" style="width:0"></div></div>
        <div class="cat-rate-pct">—</div>
        <div class="cat-rate-note">Not started</div>
      </div>`;
    }

    const barCls = rate >= 70 ? 'cat-bar-high' : rate >= 40 ? 'cat-bar-mid' : 'cat-bar-low';
    return `<div class="cat-rate-row">
      <div class="cat-rate-name" title="${escHtml(cm?.label ?? cat.id)}">${escHtml(cm?.short ?? cat.id)}</div>
      <div class="cat-rate-bar-wrap"><div class="cat-rate-bar ${barCls}" style="width:${rate}%"></div></div>
      <div class="cat-rate-pct">${rate}%</div>
      <div class="cat-rate-note">${passed}/${attempts} · ${activeStudents} student${activeStudents !== 1 ? 's' : ''}</div>
    </div>`;
  }).join('');

  return `<div class="cat-rate-grid">${rows}</div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// ENGAGEMENT TABLE  (Time & Engagement section)
// ══════════════════════════════════════════════════════════════════════════════

function _buildEngagementTable(analytics, sessions) {
  if (!analytics.length) return '<p class="dash-empty">No data yet.</p>';

  const rows = [...analytics]
    .sort((a, b) => b.sessions - a.sessions)
    .map(a => {
      const stuSessions = sessions.filter(s => s.uid === a.uid);
      const avgLOC = stuSessions.length > 0
        ? Math.round(stuSessions.reduce((sum, s) => sum + (s.linesOfCode ?? 0), 0) / stuSessions.length)
        : 0;
      const activeDays = new Set(stuSessions.map(s => {
        const ts = s.timestamp?.toDate?.() ?? new Date(s.timestamp ?? 0);
        return ts.toDateString();
      })).size;
      const lastSess = stuSessions[0];
      const lastDate = lastSess
        ? (lastSess.timestamp?.toDate?.() ?? new Date(lastSess.timestamp ?? 0))
        : null;

      return `<tr>
        <td>${escHtml(a.displayName ?? a.email.split('@')[0])}</td>
        <td class="mono">${a.sessions}</td>
        <td class="mono">${_fmtDur(a.avgDuration)}</td>
        <td class="mono">${avgLOC > 0 ? avgLOC : '—'}</td>
        <td class="mono">${activeDays}</td>
        <td class="mono">${lastDate ? _fmtDate(lastDate) : '—'}</td>
      </tr>`;
    }).join('');

  return `<div class="table-scroll engage-table-wrap">
    <table class="dash-table">
      <thead>
        <tr>
          <th>Student</th><th>Sessions</th><th>Avg time</th>
          <th>Avg LOC</th><th>Days active</th><th>Last seen</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// EXAM READINESS TABLE
// ══════════════════════════════════════════════════════════════════════════════

function _buildExamReadinessTable(students) {
  if (!students.length) return '<p class="dash-empty">No students found.</p>';

  const coreExs = EXERCISES.filter(e => CORE_CATEGORIES.includes(e.category));
  const examExs = EXERCISES.filter(e => e.category === 'exam');

  const data = students.map(stu => {
    const prog     = _allProgress?.[stu.uid];
    const totalDone  = EXERCISES.filter(e => prog?.completed?.[e.id]).length;
    const totalPct   = Math.round((totalDone / EXERCISES.length) * 100);
    const coreDone   = coreExs.filter(e => prog?.completed?.[e.id]).length;
    const corePct    = coreExs.length > 0 ? Math.round((coreDone / coreExs.length) * 100) : 0;
    const examDone   = examExs.filter(e => prog?.completed?.[e.id]).length;
    const examPct    = examExs.length > 0 ? Math.round((examDone / examExs.length) * 100) : 0;
    const readiness  = (totalPct >= 80 && corePct >= 80) ? 'high'
                     : (totalPct >= 50 && corePct >= 60) ? 'mid'
                     : 'low';
    return { stu, totalDone, totalPct, corePct, examDone, examPct, readiness };
  }).sort((a, b) => b.totalPct - a.totalPct);

  const rows = data.map(({ stu, totalPct, corePct, examDone, examPct, readiness }) => {
    const readLabel = readiness === 'high' ? 'Ready' : readiness === 'mid' ? 'Developing' : 'Not ready';
    const barColour = (pct) => pct >= 70 ? '#50C080' : pct >= 40 ? '#FFD700' : '#C05050';
    return `<tr>
      <td>${escHtml(stu.displayName ?? stu.email)}</td>
      <td>
        <div class="readiness-bar-cell">
          <div class="mini-bar-wrap"><div class="mini-bar" style="width:${totalPct}%;background:${barColour(totalPct)}"></div></div>
          <span class="mono">${totalPct}%</span>
        </div>
      </td>
      <td>
        <div class="readiness-bar-cell">
          <div class="mini-bar-wrap"><div class="mini-bar" style="width:${corePct}%;background:${barColour(corePct)}"></div></div>
          <span class="mono">${corePct}%</span>
        </div>
      </td>
      <td>
        <div class="readiness-bar-cell">
          <div class="mini-bar-wrap"><div class="mini-bar" style="width:${examPct}%;background:${barColour(examPct)}"></div></div>
          <span class="mono">${examDone}/${examExs.length}</span>
        </div>
      </td>
      <td><span class="readiness-badge ready-${readiness}">${readLabel}</span></td>
    </tr>`;
  }).join('');

  return `<div class="table-scroll">
    <table class="dash-table readiness-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Overall (${EXERCISES.length} exercises)</th>
          <th>Core topics (${coreExs.length} exercises)</th>
          <th>Exam questions (${examExs.length})</th>
          <th>Readiness</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// AT-RISK STUDENTS  (Attempt Patterns & Resilience)
// ══════════════════════════════════════════════════════════════════════════════

function _buildAtRiskStudents(students) {
  if (!students.length) return '<p class="dash-empty">No students found.</p>';

  const notStarted = [];
  const lowRate    = [];

  for (const stu of students) {
    const prog      = _allProgress?.[stu.uid];
    const attempted = EXERCISES.filter(e => prog?.submissions?.[e.id]).length;
    const completed = EXERCISES.filter(e => prog?.completed?.[e.id]).length;
    const name      = stu.displayName ?? stu.email;

    if (attempted === 0) {
      notStarted.push(name);
    } else if (attempted >= 3 && completed / attempted < 0.35) {
      lowRate.push({ name, attempted, completed, rate: Math.round((completed / attempted) * 100) });
    }
  }

  lowRate.sort((a, b) => a.rate - b.rate);

  let html = '';

  if (notStarted.length) {
    html += `<div class="risk-section">
      <div class="risk-label risk-warn">Not started (${notStarted.length})</div>
      ${notStarted.map(n => `<div class="risk-student"><span class="risk-name">${escHtml(n)}</span></div>`).join('')}
    </div>`;
  }

  if (lowRate.length) {
    html += `<div class="risk-section">
      <div class="risk-label risk-danger">Low pass rate (${lowRate.length})</div>
      ${lowRate.map(s => `<div class="risk-student">
        <span class="risk-name">${escHtml(s.name)}</span>
        <span class="risk-stat">${s.completed}/${s.attempted} (${s.rate}%)</span>
      </div>`).join('')}
    </div>`;
  }

  if (!html) {
    html = '<p class="dash-empty" style="color:#50C080">No at-risk students detected.</p>';
  }

  return `<div class="risk-list">${html}</div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// FEEDBACK SUMMARY  (Help & Support)
// ══════════════════════════════════════════════════════════════════════════════

function _buildFeedbackSummary(students) {
  if (!students.length) return '<p class="dash-empty">No students found.</p>';

  let withFeedback = 0, totalComments = 0;
  const needsFeedback = [];

  for (const stu of students) {
    const fb      = _feedback?.[stu.uid];
    const fbCount = Object.keys(fb ?? {}).length;
    if (fbCount > 0) { withFeedback++; totalComments += fbCount; }

    const prog        = _allProgress?.[stu.uid];
    const hasAttempts = EXERCISES.some(e => prog?.submissions?.[e.id]);
    if (hasAttempts && fbCount === 0) {
      needsFeedback.push(stu.displayName ?? stu.email);
    }
  }

  const coverage = students.length > 0 ? Math.round((withFeedback / students.length) * 100) : 0;

  let html = `<div class="fb-stats">
    <div class="fb-stat-row"><span>Students with feedback</span><span class="fb-stat-val">${withFeedback} / ${students.length}</span></div>
    <div class="fb-stat-row"><span>Total comments</span><span class="fb-stat-val">${totalComments}</span></div>
    <div class="fb-stat-row"><span>Coverage</span><span class="fb-stat-val">${coverage}%</span></div>
  </div>`;

  if (needsFeedback.length) {
    const shown = needsFeedback.slice(0, 6);
    const more  = needsFeedback.length - shown.length;
    html += `<div class="risk-section" style="margin-top:10px">
      <div class="risk-label risk-info">Awaiting feedback (${needsFeedback.length})</div>
      ${shown.map(n => `<div class="risk-student"><span class="risk-name">${escHtml(n)}</span></div>`).join('')}
      ${more > 0 ? `<div class="risk-student" style="color:var(--db-muted)">…and ${more} more</div>` : ''}
    </div>`;
  }

  return html;
}

// ══════════════════════════════════════════════════════════════════════════════
// CHALLENGE OVERVIEW — class analysis + student heatmap
// ══════════════════════════════════════════════════════════════════════════════

function _buildChallengeOverview(containerEl, students, uids) {
  const analysisEl = containerEl.querySelector('#ch-class-analysis');
  const listEl     = containerEl.querySelector('#ch-student-list');
  const detailEl   = containerEl.querySelector('#ch-detail-panel');
  if (!analysisEl || !listEl || !detailEl) return;

  analysisEl.innerHTML = _buildClassSkillsAnalysis(uids);
  listEl.innerHTML     = _buildStudentList(students);

  listEl.addEventListener('click', e => {
    const row = e.target.closest('.ch-stu-row[data-uid]');
    if (!row) return;
    listEl.querySelectorAll('.ch-stu-row[data-uid]').forEach(r => r.classList.remove('ch-stu-row--active'));
    row.classList.add('ch-stu-row--active');
    _renderStudentDetail(detailEl, row.dataset.uid, students);
  });
}

// ── Per-student category stats ────────────────────────────────────────────────

function _getCatStats(uid) {
  const prog = _allProgress?.[uid];
  const result = {};
  for (const cat of CATEGORIES) {
    const exs        = EXERCISES.filter(e => e.category === cat.id);
    const completed  = exs.filter(e => prog?.completed?.[e.id]).length;
    const inProgress = exs.filter(e => prog?.submissions?.[e.id] && !prog?.completed?.[e.id]).length;
    const attempted  = completed + inProgress;
    result[cat.id]   = {
      completed, inProgress, attempted,
      total: exs.length,
      pct:   attempted > 0 ? Math.round((completed / attempted) * 100) : null
    };
  }
  return result;
}

// ── Class-level category stats ────────────────────────────────────────────────

function _getClassCatStats(uids) {
  const result = {};
  for (const cat of CATEGORIES) {
    const exs = EXERCISES.filter(e => e.category === cat.id);
    let totalCompleted = 0, totalAttempted = 0, studentsActive = 0;
    for (const uid of uids) {
      const prog = _allProgress?.[uid];
      const c = exs.filter(e => prog?.completed?.[e.id]).length;
      const a = exs.filter(e => prog?.submissions?.[e.id]).length;
      totalCompleted += c;
      totalAttempted += a;
      if (a > 0) studentsActive++;
    }
    result[cat.id] = {
      totalCompleted, totalAttempted, studentsActive,
      total: exs.length,
      pct:   totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : null
    };
  }
  return result;
}

// ── Class-level skills analysis bars ─────────────────────────────────────────

function _buildClassSkillsAnalysis(uids) {
  const stats      = _getClassCatStats(uids);
  const activeCats = CATEGORIES.filter(c => stats[c.id].studentsActive > 0);

  if (!activeCats.length) {
    return '<p class="dash-empty">No challenge data yet for this class.</p>';
  }

  const strengths = activeCats.filter(c => (stats[c.id].pct ?? 0) >= 65).map(c => CONCEPT_MAP[c.id]?.label ?? c.label);
  const struggles = activeCats.filter(c => stats[c.id].pct !== null && stats[c.id].pct < 40).map(c => CONCEPT_MAP[c.id]?.label ?? c.label);

  const chips = [
    strengths.length ? `<span class="ch-chip ch-chip-strength">Class strengths: ${escHtml(strengths.join(', '))}</span>` : '',
    struggles.length ? `<span class="ch-chip ch-chip-struggle">Class struggles: ${escHtml(struggles.join(', '))}</span>` : '',
  ].filter(Boolean).join('');

  const bars = CATEGORIES.map(cat => {
    const s  = stats[cat.id];
    const cm = CONCEPT_MAP[cat.id];
    if (!s.studentsActive) {
      return `<div class="ch-skill-row">
        <div class="ch-skill-name" title="${escHtml(cm?.desc ?? '')}">${escHtml(cm?.label ?? cat.label)}</div>
        <div class="ch-skill-track"><div class="ch-skill-fill ch-bar-none" style="width:0"></div></div>
        <div class="ch-skill-pct">–</div>
        <div class="ch-skill-note">Not yet started</div>
      </div>`;
    }
    const pct = s.pct ?? 0;
    const cls = pct >= 65 ? 'ch-bar-high' : pct >= 40 ? 'ch-bar-mid' : 'ch-bar-low';
    return `<div class="ch-skill-row">
      <div class="ch-skill-name" title="${escHtml(cm?.desc ?? '')}">${escHtml(cm?.label ?? cat.label)}</div>
      <div class="ch-skill-track"><div class="ch-skill-fill ${cls}" style="width:${pct}%"></div></div>
      <div class="ch-skill-pct">${pct}%</div>
      <div class="ch-skill-note">${s.totalCompleted}/${s.totalAttempted} attempts passed · ${s.studentsActive} student${s.studentsActive !== 1 ? 's' : ''} active</div>
    </div>`;
  }).join('');

  return `
    <div class="ch-class-analysis">
      ${chips ? `<div class="ch-chips-row">${chips}</div>` : ''}
      <div class="ch-skill-bars">${bars}</div>
    </div>`;
}

// ── Student list with category dot heatmap ────────────────────────────────────

function _buildStudentList(students) {
  if (!students.length) return '<p class="dash-empty">No students in this class.</p>';

  const sorted = [...students].sort((a, b) =>
    (a.displayName ?? '').localeCompare(b.displayName ?? ''));

  const catHeaders = CATEGORIES.map(c =>
    `<div class="ch-dot-header" title="${escHtml(CONCEPT_MAP[c.id]?.label ?? c.label)}"><span>${escHtml(CONCEPT_MAP[c.id]?.short ?? c.id)}</span></div>`
  ).join('');

  const rows = sorted.map(stu => {
    const prog      = _allProgress?.[stu.uid];
    const totalXP   = prog?.totalXP ?? 0;
    const totalDone = EXERCISES.filter(e => prog?.completed?.[e.id]).length;

    const dots = CATEGORIES.map(cat => {
      const exs    = EXERCISES.filter(e => e.category === cat.id);
      const done   = exs.filter(e => prog?.completed?.[e.id]).length;
      const inProg = exs.filter(e => prog?.submissions?.[e.id] && !prog?.completed?.[e.id]).length;
      const cls    = done > 0 ? 'ch-dot-done' : inProg > 0 ? 'ch-dot-prog' : 'ch-dot-none';
      const tip    = `${CONCEPT_MAP[cat.id]?.label ?? cat.label}: ${done} completed, ${inProg} in progress`;
      const label  = done > 0 ? String(done) : inProg > 0 ? '·' : '';
      return `<div class="ch-dot ${cls}" title="${escHtml(tip)}">${label}</div>`;
    }).join('');

    return `<div class="ch-stu-row" data-uid="${escHtml(stu.uid)}">
      <div class="ch-stu-info">
        <span class="ch-stu-name">${escHtml(stu.displayName ?? stu.email)}</span>
        <span class="ch-stu-meta">${totalDone} done · ${totalXP} XP</span>
      </div>
      <div class="ch-stu-dots">${dots}</div>
    </div>`;
  }).join('');

  return `
    <div class="ch-stu-grid">
      <div class="ch-stu-row ch-stu-header">
        <div class="ch-stu-info">Student</div>
        <div class="ch-stu-dots">${catHeaders}</div>
      </div>
      ${rows}
    </div>
    <div class="ch-legend">
      <span class="ch-dot ch-dot-done ch-legend-swatch"></span>Completed &nbsp;
      <span class="ch-dot ch-dot-prog ch-legend-swatch"></span>In progress &nbsp;
      <span class="ch-dot ch-dot-none ch-legend-swatch"></span>Not started
    </div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT DETAIL PANEL  (in Challenge Progress card)
// ══════════════════════════════════════════════════════════════════════════════

function _renderStudentDetail(detailEl, uid, students) {
  const stu = (students ?? _students).find(s => s.uid === uid);
  if (!stu) return;

  const prog        = _allProgress?.[uid];
  const catStats    = _getCatStats(uid);
  const totalDone   = EXERCISES.filter(e => prog?.completed?.[e.id]).length;
  const totalInProg = EXERCISES.filter(e => prog?.submissions?.[e.id] && !prog?.completed?.[e.id]).length;
  const totalXP     = prog?.totalXP ?? 0;

  const activeCats  = CATEGORIES.filter(c => catStats[c.id].attempted > 0);
  const strengths   = activeCats.filter(c => (catStats[c.id].pct ?? 0) >= 65).map(c => CONCEPT_MAP[c.id]?.label ?? c.label);
  const struggles   = activeCats.filter(c => catStats[c.id].pct !== null && catStats[c.id].pct < 40).map(c => CONCEPT_MAP[c.id]?.label ?? c.label);
  const notStarted  = CATEGORIES.filter(c => catStats[c.id].attempted === 0).map(c => CONCEPT_MAP[c.id]?.short ?? c.id);
  const narrative   = _generateNarrative(stu, catStats, activeCats, totalDone, totalInProg);

  const exerciseListHTML = CATEGORIES.map(cat => {
    const exs      = EXERCISES.filter(e => e.category === cat.id);
    const attempted = exs.filter(e => prog?.submissions?.[e.id] || prog?.completed?.[e.id]);
    if (!attempted.length) return '';

    const s      = catStats[cat.id];
    const catPct = s.pct !== null ? `${s.completed}/${s.attempted} (${s.pct}%)` : '–';

    const items = attempted.map(ex => {
      const done  = !!prog?.completed?.[ex.id];
      const cls   = done ? 'ex-done' : 'ex-prog';
      const icon  = done ? '✓' : '…';
      const hasFb = !!_feedback?.[uid]?.[ex.id];
      return `<div class="ch-ex-row ch-ex-row--${cls}" data-ex-id="${escHtml(ex.id)}" data-uid="${escHtml(uid)}">
        <span class="ch-ex-icon">${icon}</span>
        <span class="ch-ex-title">${escHtml(ex.title)}</span>
        <span class="ch-ex-diff diff-${ex.difficulty}">${ex.difficulty[0].toUpperCase()}</span>
        <span class="ch-ex-xp">${ex.xp}</span>
        ${hasFb ? '<span class="ch-ex-fb-dot" title="Feedback given">✏</span>' : ''}
      </div>`;
    }).join('');

    return `<div class="ch-detail-cat">
      <div class="ch-detail-cat-hdr">
        ${escHtml(CONCEPT_MAP[cat.id]?.label ?? cat.label)}
        <span class="ch-cat-pct">${catPct} completed</span>
      </div>
      ${items}
    </div>`;
  }).filter(Boolean).join('');

  const chips = [
    strengths.length  ? `<span class="ch-chip ch-chip-strength">Strong: ${escHtml(strengths.join(', '))}</span>` : '',
    struggles.length  ? `<span class="ch-chip ch-chip-struggle">Needs work: ${escHtml(struggles.join(', '))}</span>` : '',
    notStarted.length ? `<span class="ch-chip ch-chip-info">Not yet started: ${escHtml(notStarted.join(', '))}</span>` : '',
  ].filter(Boolean).join('');

  detailEl.innerHTML = `
    <div class="ch-detail-header">
      <div class="ch-detail-name">${escHtml(stu.displayName ?? stu.email)}</div>
      <div class="ch-detail-summary">${totalDone} completed · ${totalInProg} in progress · ${totalXP} XP</div>
    </div>

    <div class="ch-narrative">${escHtml(narrative)}</div>
    ${chips ? `<div class="ch-chips-row">${chips}</div>` : ''}

    <div class="ch-detail-body">
      <div class="ch-exercise-list" id="ch-exercise-list">
        ${exerciseListHTML || '<p class="dash-empty" style="padding:12px">No exercises attempted yet.</p>'}
      </div>
      <div class="ch-code-view" id="ch-code-view">
        <p class="ch-code-hint">← Click an exercise to view the student\'s pseudocode.</p>
      </div>
    </div>`;

  detailEl.querySelector('#ch-exercise-list')?.addEventListener('click', e => {
    const row = e.target.closest('.ch-ex-row[data-ex-id]');
    if (!row) return;
    detailEl.querySelectorAll('.ch-ex-row').forEach(r => r.classList.remove('ch-ex-row--selected'));
    row.classList.add('ch-ex-row--selected');
    _renderCodeView(detailEl.querySelector('#ch-code-view'), row.dataset.uid, row.dataset.exId);
  });
}

// ── Generate teacher-facing narrative ─────────────────────────────────────────

function _generateNarrative(stu, catStats, activeCats, totalDone, totalInProg) {
  const name = stu.displayName ?? stu.email.split('@')[0];
  if (totalDone === 0 && totalInProg === 0) {
    return `${name} has not yet started any challenges.`;
  }

  const sorted  = [...activeCats].sort((a, b) => (catStats[b.id].pct ?? 0) - (catStats[a.id].pct ?? 0));
  const topCat  = sorted[0];
  const weakCat = activeCats.find(c => catStats[c.id].pct !== null && catStats[c.id].pct < 40);

  let text = `${name} has completed ${totalDone} exercise${totalDone !== 1 ? 's' : ''} across ${activeCats.length} topic area${activeCats.length !== 1 ? 's' : ''}.`;

  if (topCat && (catStats[topCat.id].pct ?? 0) >= 65) {
    text += ` Shows confidence with ${CONCEPT_MAP[topCat.id]?.label ?? topCat.label}.`;
  }
  if (weakCat) {
    text += ` ${CONCEPT_MAP[weakCat.id]?.label ?? weakCat.label} has a low pass rate — targeted support may help.`;
  }
  if (totalInProg > 0) {
    text += ` ${totalInProg} exercise${totalInProg !== 1 ? 's' : ''} currently in progress.`;
  }
  return text;
}

// ── Code view + feedback ──────────────────────────────────────────────────────

function _renderCodeView(codeEl, uid, exId) {
  if (!codeEl) return;

  const ex               = EXERCISES.find(e => e.id === exId);
  const prog             = _allProgress?.[uid];
  const sub              = prog?.submissions?.[exId];
  const done             = !!prog?.completed?.[exId];
  const existingFeedback = _feedback?.[uid]?.[exId] ?? '';

  const statusHTML = done
    ? '<span class="ch-code-status ch-status-done">✓ Passed</span>'
    : '<span class="ch-code-status ch-status-prog">In progress</span>';

  const codeHTML = sub?.source
    ? `<pre class="ch-sub-code">${highlightSource(sub.source)}</pre>`
    : '<p class="dash-empty" style="padding:12px">No code saved for this exercise yet.</p>';

  const safeId   = exId.replace(/[^a-z0-9]/gi, '_');
  const descHTML = ex?.description
    ? `<div class="ch-ex-description">${ex.description.replace(/\n/g, '<br>')}</div>`
    : '';

  codeEl.innerHTML = `
    <div class="ch-code-header">
      <span class="ch-code-title">${escHtml(ex?.title ?? exId)}</span>
      ${statusHTML}
    </div>
    ${descHTML}
    <div class="ch-code-scroll">${codeHTML}</div>
    <div class="ch-feedback">
      <label class="ch-feedback-label">Teacher feedback</label>
      <textarea class="ch-feedback-textarea" id="ch-fb-${safeId}" rows="3"
        placeholder="Write feedback for this student…">${escHtml(existingFeedback)}</textarea>
      <div class="ch-feedback-row">
        <button class="btn-primary ch-fb-btn" id="ch-fb-save-${safeId}">Save Feedback</button>
        <span class="ch-fb-status hidden" id="ch-fb-status-${safeId}"></span>
      </div>
    </div>`;

  codeEl.querySelector(`#ch-fb-save-${safeId}`)?.addEventListener('click', async () => {
    const btn      = codeEl.querySelector(`#ch-fb-save-${safeId}`);
    const textarea = codeEl.querySelector(`#ch-fb-${safeId}`);
    const statusEl = codeEl.querySelector(`#ch-fb-status-${safeId}`);
    const comment  = textarea?.value ?? '';
    btn.disabled    = true;
    btn.textContent = 'Saving…';
    try {
      await saveTeacherFeedback(uid, exId, comment);
      if (!_feedback)      _feedback = {};
      if (!_feedback[uid]) _feedback[uid] = {};
      _feedback[uid][exId]   = comment;
      statusEl.textContent   = '✓ Saved';
      statusEl.className     = 'ch-fb-status ch-fb-ok';
      setTimeout(() => statusEl.classList.add('hidden'), 3000);
      const exRow = document.querySelector(`.ch-ex-row[data-ex-id="${CSS.escape(exId)}"]`);
      if (exRow && comment && !exRow.querySelector('.ch-ex-fb-dot')) {
        const dot = document.createElement('span');
        dot.className = 'ch-ex-fb-dot'; dot.title = 'Feedback given'; dot.textContent = '✏';
        exRow.appendChild(dot);
      }
    } catch (err) {
      statusEl.textContent = '✗ Failed to save';
      statusEl.className   = 'ch-fb-status ch-fb-err';
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Save Feedback';
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// CLASS SKILLS OVERVIEW  (Skills matrix)
// ══════════════════════════════════════════════════════════════════════════════

const AVATAR_COLOURS = ['#00809D','#D3AF37','#50C080','#E09050','#9B59B6','#E74C3C','#3498DB','#1ABC9C'];

function _buildSkillsMatrix(analytics) {
  if (!analytics.length) return '<p class="dash-empty">No student data yet.</p>';
  const areas = [
    { key: 'algorithmDesign',       label: 'Algorithm Design' },
    { key: 'computationalThinking', label: 'Computational Thinking' },
    { key: 'pseudocodeSyntax',      label: 'Pseudocode Syntax' }
  ];
  const rows = analytics
    .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''))
    .map((a, i) => {
      const initials = (a.displayName ?? a.email)
        .split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
      const colour   = AVATAR_COLOURS[i % AVATAR_COLOURS.length];
      return `
        <div class="skills-row">
          <div class="skills-name">
            <span class="stu-avatar" style="background:${colour}">${escHtml(initials)}</span>
            ${escHtml(a.displayName ?? a.email)}
          </div>
          ${areas.map(area => {
            const val = a.skills[area.key];
            const cls = val >= 70 ? 'high' : val >= 40 ? 'mid' : 'low';
            return `<div class="skill-cell">
              <div class="skill-label">${area.label}</div>
              <div class="skill-bar-wrap"><div class="skill-bar ${cls}" style="width:${val}%"></div></div>
              <div class="skill-pct">${val}%</div>
            </div>`;
          }).join('')}
        </div>`;
    }).join('');
  return `<div class="skills-matrix">${rows}</div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT DETAILS TABLE  (Comparative / Cohort)
// ══════════════════════════════════════════════════════════════════════════════

function _buildStudentTable(analytics) {
  if (!analytics.length) return '<p class="dash-empty">No students found.</p>';
  const sorted = [...analytics].sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''));
  const rows = sorted.map(a => `
      <tr class="dash-stu-row" data-uid="${escHtml(a.uid)}" style="cursor:pointer">
        <td>${escHtml(a.displayName ?? '')}</td>
        <td class="mono">${escHtml(a.email)}</td>
        <td>${a.sessions}</td>
        <td>${a.errorRate}</td>
        <td>${_fmtDur(a.avgDuration)}</td>
        <td>
          <span class="skill-pill ${_pill(a.skills.algorithmDesign)}" title="Algorithm Design">${a.skills.algorithmDesign}%</span>
          <span class="skill-pill ${_pill(a.skills.computationalThinking)}" title="Computational Thinking">${a.skills.computationalThinking}%</span>
          <span class="skill-pill ${_pill(a.skills.pseudocodeSyntax)}" title="Pseudocode Syntax">${a.skills.pseudocodeSyntax}%</span>
        </td>
      </tr>`).join('');
  return `
    <div class="table-scroll">
      <table class="dash-table" id="student-detail-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th>
            <th>Sessions</th><th>Errors/session</th><th>Avg duration</th>
            <th>Skills (Alg / CT / Syntax)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function _bindStudentTable(containerEl) {
  const table  = containerEl.querySelector('#student-detail-table');
  const sideEl = containerEl.querySelector('#student-detail-side');
  if (!table || !sideEl) return;
  table.addEventListener('click', e => {
    const row = e.target.closest('.dash-stu-row[data-uid]');
    if (!row) return;
    table.querySelectorAll('.dash-stu-row').forEach(r => r.classList.remove('dash-stu-row--active'));
    row.classList.add('dash-stu-row--active');
    _renderStudentSidebar(sideEl, row.dataset.uid);
  });
}

function _renderStudentSidebar(sideEl, uid) {
  const stu     = _students.find(s => s.uid === uid);
  if (!stu) return;

  const prog      = _allProgress?.[uid];
  const catStats  = _getCatStats(uid);
  const activeCats = CATEGORIES.filter(c => catStats[c.id].attempted > 0);
  const totalDone  = EXERCISES.filter(e => prog?.completed?.[e.id]).length;
  const totalInProg = EXERCISES.filter(e => prog?.submissions?.[e.id] && !prog?.completed?.[e.id]).length;
  const totalXP   = prog?.totalXP ?? 0;
  const narrative = _generateNarrative(stu, catStats, activeCats, totalDone, totalInProg);

  const strengths = activeCats.filter(c => (catStats[c.id].pct ?? 0) >= 65).map(c => CONCEPT_MAP[c.id]?.label ?? c.label);
  const struggles = activeCats.filter(c => catStats[c.id].pct !== null && catStats[c.id].pct < 40).map(c => CONCEPT_MAP[c.id]?.label ?? c.label);

  // Session engagement stats for this student
  const stuSessions = _sessions.filter(s => s.uid === uid);
  const avgDur = stuSessions.length > 0
    ? Math.round(stuSessions.reduce((sum, s) => sum + (s.durationMs ?? 0), 0) / stuSessions.length)
    : 0;
  const activeDays = new Set(stuSessions.map(s => {
    const ts = s.timestamp?.toDate?.() ?? new Date(s.timestamp ?? 0);
    return ts.toDateString();
  })).size;

  // Exam readiness
  const coreExs = EXERCISES.filter(e => CORE_CATEGORIES.includes(e.category));
  const coreDone = coreExs.filter(e => prog?.completed?.[e.id]).length;
  const corePct = coreExs.length > 0 ? Math.round((coreDone / coreExs.length) * 100) : 0;
  const totalPct = Math.round((totalDone / EXERCISES.length) * 100);
  const readiness = (totalPct >= 80 && corePct >= 80) ? 'high'
                  : (totalPct >= 50 && corePct >= 60) ? 'mid' : 'low';
  const readLabel = readiness === 'high' ? 'Ready' : readiness === 'mid' ? 'Developing' : 'Not ready';

  const chips = [
    strengths.length ? `<span class="ch-chip ch-chip-strength">Strong: ${escHtml(strengths.join(', '))}</span>` : '',
    struggles.length ? `<span class="ch-chip ch-chip-struggle">Needs work: ${escHtml(struggles.join(', '))}</span>` : '',
  ].filter(Boolean).join('');

  const bars = CATEGORIES.map(cat => {
    const s = catStats[cat.id];
    if (!s.attempted) return '';
    const pct = s.pct ?? 0;
    const cls = pct >= 65 ? 'ch-bar-high' : pct >= 40 ? 'ch-bar-mid' : 'ch-bar-low';
    return `<div class="ch-skill-row">
      <div class="ch-skill-name">${escHtml(CONCEPT_MAP[cat.id]?.short ?? cat.id)}</div>
      <div class="ch-skill-track"><div class="ch-skill-fill ${cls}" style="width:${pct}%"></div></div>
      <div class="ch-skill-pct">${pct}%</div>
    </div>`;
  }).filter(Boolean).join('');

  sideEl.innerHTML = `
    <h3 class="dash-card-title">${escHtml(stu.displayName ?? stu.email)}</h3>
    <div class="dash-stu-summary">${totalDone} completed · ${totalInProg} in progress · ${totalXP} XP</div>

    <div class="stu-side-stats">
      <div class="stu-side-stat"><span class="stu-side-label">Sessions</span><span class="stu-side-val">${stuSessions.length}</span></div>
      <div class="stu-side-stat"><span class="stu-side-label">Avg duration</span><span class="stu-side-val">${_fmtDur(avgDur)}</span></div>
      <div class="stu-side-stat"><span class="stu-side-label">Days active</span><span class="stu-side-val">${activeDays}</span></div>
      <div class="stu-side-stat"><span class="stu-side-label">Exam readiness</span><span class="stu-side-val"><span class="readiness-badge ready-${readiness}">${readLabel}</span></span></div>
    </div>

    <div class="ch-narrative" style="margin:10px 0">${escHtml(narrative)}</div>
    ${chips ? `<div class="ch-chips-row" style="margin-bottom:10px">${chips}</div>` : ''}
    <div class="ch-skill-bars">${bars || '<p class="dash-empty">No challenges attempted yet.</p>'}</div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// CANVAS CHARTS
// ══════════════════════════════════════════════════════════════════════════════

function _chartColours() {
  const light = document.getElementById('teacher-dashboard')?.dataset.dashTheme === 'light';
  return {
    text:  light ? '#0D1E35' : '#e8f4f8',
    muted: light ? '#3a5a6a' : '#6a8a98',
  };
}

function _setupCanvas(canvas, cssWidth, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = Math.round(cssWidth  * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width  = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, W: cssWidth, H: cssHeight };
}

function _renderConstructChart(sessions) {
  const canvas = document.getElementById('chart-constructs');
  if (!canvas) return;
  const ALL_CONSTRUCTS = ['DECLARE','INPUT','OUTPUT','IF','CASE','FOR','WHILE','REPEAT','CALL','FILE'];
  const used    = {};
  const errored = {};
  ALL_CONSTRUCTS.forEach(c => { used[c] = 0; errored[c] = 0; });

  for (const s of sessions) {
    const cs = new Set(s.constructs ?? []);
    const hasErrors = (s.errorCount ?? 0) > 0;
    for (const c of ALL_CONSTRUCTS) {
      if (cs.has(c)) { used[c]++; if (hasErrors) errored[c]++; }
    }
  }

  const entries = ALL_CONSTRUCTS
    .filter(c => used[c] > 0)
    .map(c => ({ label: c, pct: Math.round(((used[c] - errored[c]) / used[c]) * 100), n: used[c] }));

  if (!entries.length) { _drawEmpty(canvas, 'No data yet'); return; }

  const pad    = { top: 20, right: 16, bottom: 44, left: 40 };
  const barW   = 28;
  const barGap = 10;
  const cssW   = Math.max(canvas.parentElement.clientWidth - 32,
                          pad.left + pad.right + entries.length * (barW + barGap));
  const cssH   = 200;
  const { ctx, W, H } = _setupCanvas(canvas, cssW, cssH);
  const C = _chartColours();

  ctx.strokeStyle = 'rgba(128,128,128,0.15)'; ctx.lineWidth = 1;
  ctx.fillStyle = C.muted; ctx.font = '9px DM Sans, sans-serif'; ctx.textAlign = 'right';
  [0, 25, 50, 75, 100].forEach(pct => {
    const y = pad.top + ((100 - pct) / 100) * (H - pad.top - pad.bottom);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillText(`${pct}%`, pad.left - 4, y + 3);
  });

  entries.forEach(({ label, pct, n }, i) => {
    const x    = pad.left + i * (barW + barGap);
    const barH = (pct / 100) * (H - pad.top - pad.bottom);
    const y    = H - pad.bottom - barH;
    const hue  = pct >= 80 ? 150 : pct >= 50 ? 45 : 0;
    ctx.fillStyle = `hsl(${hue}, 65%, 55%)`;
    _roundRect(ctx, x, y, barW, barH, 3); ctx.fill();

    ctx.fillStyle = C.text; ctx.font = 'bold 9px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${pct}%`, x + barW / 2, Math.max(y - 4, pad.top + 9));

    ctx.fillStyle = C.muted; ctx.font = '9px DM Sans, sans-serif';
    ctx.fillText(label, x + barW / 2, H - pad.bottom + 13);
    ctx.fillText(`(${n})`, x + barW / 2, H - pad.bottom + 25);
  });
}

function _renderErrorChart(sessions) {
  const canvas = document.getElementById('chart-errors');
  if (!canvas) return;
  const counts = {};
  for (const s of sessions) for (const e of (s.errors ?? [])) {
    const k = _catError(e.message); counts[k] = (counts[k] ?? 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) { _drawEmpty(canvas, 'No errors recorded'); return; }

  const rowH  = 30;
  const padT  = 8;
  const padB  = 20;
  const cssW  = canvas.parentElement.clientWidth - 32;
  const cssH  = padT + entries.length * rowH + padB;
  const { ctx, W, H } = _setupCanvas(canvas, cssW, cssH);
  const C = _chartColours();

  const total   = entries.reduce((s, [, v]) => s + v, 0);
  const colors  = [PALETTE.error, PALETTE.warn, PALETTE.gold, PALETTE.teal, PALETTE.tealLight, PALETTE.success];
  const labelW  = 105;
  const countW  = 70;
  const barAreaX = labelW;
  const barAreaW = W - labelW - countW - 8;

  ctx.textBaseline = 'middle';

  entries.forEach(([label, val], i) => {
    const y    = padT + i * rowH;
    const midY = y + rowH / 2;
    const barW = (val / entries[0][1]) * barAreaW;
    const pct  = Math.round((val / total) * 100);
    const color = colors[i % colors.length];

    ctx.fillStyle = color + '28';
    _roundRect(ctx, barAreaX, y + 6, barAreaW, rowH - 12, 3); ctx.fill();
    ctx.fillStyle = color;
    _roundRect(ctx, barAreaX, y + 6, Math.max(barW, 4), rowH - 12, 3); ctx.fill();

    ctx.fillStyle = C.text; ctx.font = '10px DM Sans, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(label, labelW - 8, midY);

    ctx.fillStyle = C.muted; ctx.font = '9px DM Sans, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`${val} (${pct}%)`, barAreaX + barAreaW + 6, midY);
  });

  ctx.fillStyle = C.muted; ctx.font = '10px DM Sans, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText(`${total} total errors`, W - 4, H - 2);
}

function _renderActivityChart(sessions, days) {
  const canvas = document.getElementById('chart-activity');
  if (!canvas) return;
  const now = Date.now();

  let DAYS = days || 0;
  if (!DAYS) {
    let earliest = now;
    for (const s of sessions) {
      const ts = s.timestamp?.toDate?.() ?? new Date(s.timestamp ?? 0);
      if (ts.getTime() < earliest) earliest = ts.getTime();
    }
    DAYS = Math.max(7, Math.ceil((now - earliest) / 864e5) + 1);
  }

  const buckets = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(now - (DAYS - 1 - i) * 864e5);
    return { label: `${d.getMonth()+1}/${d.getDate()}`, count: 0 };
  });
  for (const s of sessions) {
    const ts = s.timestamp?.toDate?.() ?? new Date(s.timestamp ?? 0);
    const daysAgo = Math.floor((now - ts.getTime()) / 864e5);
    if (daysAgo >= 0 && daysAgo < DAYS) buckets[DAYS - 1 - daysAgo].count++;
  }

  const cssW = canvas.parentElement.clientWidth - 32;
  const cssH = 200;
  const { ctx, W, H } = _setupCanvas(canvas, cssW, cssH);
  const C   = _chartColours();
  const pad = { top: 20, right: 16, bottom: 36, left: 42 };
  const maxVal = Math.max(...buckets.map(b => b.count), 1);
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const stepX  = DAYS > 1 ? chartW / (DAYS - 1) : chartW;
  ctx.clearRect(0, 0, W, H);

  const yTicks = maxVal <= 5 ? maxVal : 5;
  ctx.strokeStyle = 'rgba(128,128,128,0.15)'; ctx.lineWidth = 1;
  ctx.fillStyle = C.muted; ctx.font = '9px DM Sans, sans-serif'; ctx.textAlign = 'right';
  for (let i = 0; i <= yTicks; i++) {
    const val = Math.round((maxVal / yTicks) * (yTicks - i));
    const y   = pad.top + (chartH / yTicks) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillText(val, pad.left - 4, y + 3);
  }

  const pts = buckets.map((b, i) => ({
    x: pad.left + i * stepX,
    y: H - pad.bottom - (b.count / maxVal) * chartH
  }));

  const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
  grad.addColorStop(0, 'rgba(0,128,157,0.35)'); grad.addColorStop(1, 'rgba(0,128,157,0)');
  ctx.beginPath(); ctx.moveTo(pts[0].x, H - pad.bottom);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, H - pad.bottom); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  ctx.beginPath(); ctx.strokeStyle = PALETTE.teal; ctx.lineWidth = 2;
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  buckets.forEach((b, i) => {
    if (!b.count) return;
    ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = PALETTE.teal; ctx.lineWidth = 1.5; ctx.stroke();
  });

  const labelEvery = Math.ceil(DAYS / 10);
  ctx.fillStyle = C.muted; ctx.font = '9px DM Sans, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  buckets.forEach((b, i) => {
    if (i % labelEvery === 0 || i === DAYS - 1)
      ctx.fillText(b.label, pts[i].x, H - pad.bottom + 5);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function _catError(msg) {
  const m = (msg ?? '').toLowerCase();
  if (m.includes('syntax') || m.includes('expected') || m.includes('unexpected')) return 'Syntax';
  if (m.includes('undefined') || m.includes('not declared'))  return 'Undefined var';
  if (m.includes('division') || m.includes('divide'))         return 'Div by zero';
  if (m.includes('array') || m.includes('index'))             return 'Array bounds';
  if (m.includes('type') || m.includes('expected number'))    return 'Type mismatch';
  if (m.includes('file') || m.includes('eof'))                return 'File error';
  return 'Runtime';
}

function _countActive(sessions, days) {
  const cutoff = Date.now() - days * 864e5;
  const uids   = new Set();
  for (const s of sessions) {
    const ts = s.timestamp?.toDate?.() ?? new Date(s.timestamp ?? 0);
    if (ts.getTime() >= cutoff) uids.add(s.uid);
  }
  return uids.size;
}

function _fmtDur(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function _fmtDate(d) {
  const now  = new Date();
  const diff = Math.floor((now - d) / 864e5);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function _pill(val) { return val >= 70 ? 'skill-high' : val >= 40 ? 'skill-mid' : 'skill-low'; }
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ══════════════════════════════════════════════════════════════════════════════
// SUBMISSION RE-VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

function _normaliseOutput(s) {
  return String(s ?? '').replace(/^[$£€]/, '').trim();
}
function _outputsEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => _normaliseOutput(v) === _normaliseOutput(b[i]));
}

async function _runExerciseTests(source, ex) {
  if (!ex.tests?.length) return true;
  if (checkUndeclaredVariables(source).length > 0) return false;
  if (ex.sourceCheck && ex.sourceCheck(source) !== null) return false;

  let execSource = source;
  if (ex.prelude) {
    const lines     = source.split('\n');
    const declLines = lines.filter(l => /^\s*DECLARE\b/i.test(l));
    const restLines = lines.filter(l => !/^\s*DECLARE\b/i.test(l));
    execSource = [...declLines, ex.prelude, ...restLines].join('\n');
  }

  for (const test of ex.tests) {
    const interp  = new Interpreter();
    const outputs = [];
    interp.onOutput = t => outputs.push(String(t));
    interp.setInputQueue([...(test.inputs ?? [])]);
    try {
      await interp.run(execSource);
    } catch {
      return false;
    }
    const dataOutputs = outputs.filter((_, i) => !interp._promptIndices.has(i));
    if (!_outputsEqual(dataOutputs, test.expected)) return false;
  }
  return true;
}

export async function revalidateAllSubmissions(statusEl) {
  if (!_allProgress) return 0;

  const exMap = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
  let invalidated = 0;

  for (const [uid, prog] of Object.entries(_allProgress)) {
    if (!prog?.completed) continue;
    let changed    = false;
    let totalXP    = prog.totalXP ?? 0;
    const completed = { ...prog.completed };

    for (const [exId, record] of Object.entries(completed)) {
      const ex     = exMap[exId];
      if (!ex) continue;
      const source = prog.submissions?.[exId]?.source ?? '';
      if (!source) continue;

      const stillPasses = await _runExerciseTests(source, ex);
      if (!stillPasses) {
        const xpToDeduct = record?.xp ?? ex.xp ?? 0;
        totalXP -= xpToDeduct;
        delete completed[exId];
        changed = true;
        invalidated++;
        if (statusEl) statusEl.textContent = `Checked… ${invalidated} invalidated so far`;
      }
    }

    if (changed) {
      const newTotalXP = Math.max(0, totalXP);
      const updated    = { ...prog, completed, totalXP: newTotalXP };
      await saveChallengeProgress(uid, updated);
      _allProgress[uid] = updated;

      const stu = _students?.find(s => s.uid === uid);
      if (stu) {
        try {
          await updateLeaderboard(uid, {
            displayName:    stu.displayName ?? stu.email,
            classCode:      stu.classCode ?? '',
            role:           stu.role ?? 'student',
            totalXP:        newTotalXP,
            completedCount: Object.keys(completed).length,
            level:          Math.floor(newTotalXP / 100) + 1,
            badgeCount:     (updated.badges ?? []).length,
          });
        } catch (e) {
          console.warn(`Leaderboard update failed for ${uid}:`, e.message);
        }
      }
    }
  }

  return invalidated;
}

function _drawEmpty(canvas, text) {
  const cssW = canvas.parentElement.clientWidth - 32;
  const cssH = parseInt(canvas.style.height, 10) || 180;
  const { ctx, W, H } = _setupCanvas(canvas, cssW, cssH);
  ctx.fillStyle = _chartColours().muted; ctx.font = '13px DM Sans, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2);
}

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
