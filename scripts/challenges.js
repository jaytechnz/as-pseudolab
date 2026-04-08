// ─── Challenge System ──────────────────────────────────────────────────────────
// Manages the gamified exercise system: test running, XP, badges, sidebar UI.

import { EXERCISES, CATEGORIES } from './exercises.js';
import { Interpreter }           from './interpreter.js';
import {
  getChallengeProgress,
  saveChallengeProgress,
  updateLeaderboard,
  getClassLeaderboard,
  getAllLeaderboardEntries
} from './storage.js';

// Strip FOR...NEXT blocks containing RANDOM() from a line array.
// Used during test execution so prelude-fixed arrays aren't overwritten.
function _stripRandomLoops(lines) {
  const result = [];
  let i = 0;
  while (i < lines.length) {
    if (/^\s*FOR\b/i.test(lines[i])) {
      const block = [lines[i]];
      let depth = 1;
      i++;
      while (i < lines.length && depth > 0) {
        if (/^\s*FOR\b/i.test(lines[i])) depth++;
        if (/^\s*NEXT\b/i.test(lines[i])) depth--;
        block.push(lines[i]);
        i++;
      }
      if (!block.some(l => /\bRANDOM\b/i.test(l))) result.push(...block);
    } else {
      result.push(lines[i++]);
    }
  }
  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const BADGES = [
  { id: 'first_step',   label: 'First Step',       desc: 'Complete your first exercise',        threshold: 1,   type: 'total' },
  { id: 'getting_started', label: 'Getting Started', desc: 'Complete 10 exercises',             threshold: 10,  type: 'total' },
  { id: 'halfway',      label: 'Halfway There',     desc: 'Complete 100 exercises',              threshold: 100, type: 'total' },
  { id: 'master',       label: 'Pseudocode Master', desc: 'Complete all 200 exercises',          threshold: 200, type: 'total' },
  { id: 'basics_done',  label: 'Basics Champion',   desc: 'Complete all Basics exercises',       category: 'basics'     },
  { id: 'ops_done',     label: 'Operator Guru',     desc: 'Complete all Operators exercises',    category: 'operators'  },
  { id: 'sel_done',     label: 'Selection Expert',  desc: 'Complete all Selection exercises',    category: 'selection'  },
  { id: 'itr_done',     label: 'Loop Master',       desc: 'Complete all Iteration exercises',    category: 'iteration'  },
  { id: 'lib_done',     label: 'Library Pro',       desc: 'Complete all Library exercises',      category: 'library'    },
  { id: 'proc_done',    label: 'Function Wizard',   desc: 'Complete all Functions exercises',    category: 'procedures' },
  { id: 'arr_done',     label: 'Array Ace',         desc: 'Complete all Arrays exercises',       category: 'arrays'     },
  { id: 'file_done',    label: 'File Handler',      desc: 'Complete all File Handling exercises',category: 'files'      },
  { id: 'alg_done',     label: 'Algorithm Expert',  desc: 'Complete all Standard Algorithms',    category: 'algorithms' },
  { id: 'xp_500',       label: 'XP 500',            desc: 'Earn 500 XP',                         threshold: 500, type: 'xp'   },
  { id: 'xp_1000',      label: 'XP 1000',           desc: 'Earn 1000 XP',                        threshold:1000, type: 'xp'   },
];

const $ = id => document.getElementById(id);

// ══════════════════════════════════════════════════════════════════════════════
// CHALLENGE MANAGER
// ══════════════════════════════════════════════════════════════════════════════

export class ChallengeManager {
  constructor({ editor, appendOutput, clearOutput, onXpChange, onExerciseLoad }) {
    this.editor          = editor;
    this.appendOutput    = appendOutput;
    this.clearOutput     = clearOutput;
    this.onXpChange      = onXpChange;      // callback(totalXP, level)
    this.onExerciseLoad  = onExerciseLoad;  // callback(title) — notifies app of active exercise

    this.uid             = null;
    this.classCode       = '';
    this.progress        = { completed: {}, totalXP: 0, badges: [] };
    this.currentExercise = null;
    this._autoSaveTimer  = null;

    // DOM refs (populated after DOM is ready)
    this.challengeList   = $('challenge-list');
    this.challengePanel  = $('challenge-panel');
    this.panelTitle      = $('ch-panel-title');
    this.panelBody       = $('ch-panel-body');
    this.panelBadge      = $('ch-panel-badge');
    this.testResults     = $('ch-test-results');
    this.closePanelBtn   = $('btn-close-challenge');
    this.xpDisplay       = $('ch-xp-display');
    this.levelDisplay    = $('ch-level-display');
    this.badgeToast      = $('badge-toast');

    this._bindPanelEvents();
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  async init(uid, classCode = '', displayName = '', role = 'student') {
    this.uid          = uid;
    this.classCode    = classCode;
    this._displayName = displayName;
    this.role         = role;
    try {
      const saved = await getChallengeProgress(uid);
      if (saved) this.progress = saved;
    } catch (e) {
      console.warn('Could not load challenge progress:', e);
    }
    this.renderSidebar();
    this._updateXpDisplay();

    // Debounced auto-save: persist code 1.5 s after the student stops typing
    this.editor.onChange(() => {
      if (!this.currentExercise) return;
      clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = setTimeout(() => {
        this._saveCodeForExercise(this.currentExercise.id, this.editor.getValue());
      }, 1500);
    });
  }

  reset() {
    clearTimeout(this._autoSaveTimer);
    this.uid      = null;
    this.progress = { completed: {}, totalXP: 0, badges: [] };
    this.currentExercise = null;
    this._hideChallengePanel();
  }

  // ── Sidebar Rendering ─────────────────────────────────────────────────────

  renderSidebar() {
    if (!this.challengeList) return;
    const completed = this.progress.completed ?? {};

    const html = CATEGORIES.map(cat => {
      const exercises = EXERCISES.filter(e => e.category === cat.id);
      const doneCount = exercises.filter(e => completed[e.id]).length;
      const pct       = Math.round((doneCount / exercises.length) * 100);

      const items = exercises.map(e => {
        const done = !!completed[e.id];
        const diffIcon = { easy: '●', medium: '◆', hard: '★' }[e.difficulty];
        const diffClass = `diff-${e.difficulty}`;
        return `<div class="ch-item ${done ? 'ch-item--done' : ''}" data-id="${e.id}" title="${e.title}">
          <span class="ch-item-status">${done ? '✓' : ''}</span>
          <span class="ch-item-icon ${diffClass}">${diffIcon}</span>
          <span class="ch-item-title">${escHtml(e.title)}</span>
          <span class="ch-item-xp">${e.xp}xp</span>
        </div>`;
      }).join('');

      return `<div class="ch-category" data-cat="${cat.id}">
        <div class="ch-cat-header" data-cat="${cat.id}">
          <span class="ch-cat-chevron">▶</span>
          <span class="ch-cat-label">${escHtml(cat.label)}</span>
          <span class="ch-cat-progress">${doneCount}/${exercises.length}</span>
        </div>
        <div class="ch-cat-bar"><div class="ch-cat-fill" style="width:${pct}%"></div></div>
        <div class="ch-cat-items hidden">${items}</div>
      </div>`;
    }).join('');

    this.challengeList.innerHTML = html;

    // Restore open categories
    const openCats = JSON.parse(localStorage.getItem('chOpenCats') || '[]');
    openCats.forEach(catId => this._expandCategory(catId));

    // Bind events
    this.challengeList.querySelectorAll('.ch-cat-header').forEach(hdr => {
      hdr.addEventListener('click', () => this._toggleCategory(hdr.dataset.cat));
    });
    this.challengeList.querySelectorAll('.ch-item').forEach(item => {
      item.addEventListener('click', () => this.loadExercise(item.dataset.id));
    });
  }

  _toggleCategory(catId) {
    const cat = this.challengeList.querySelector(`.ch-category[data-cat="${catId}"]`);
    if (!cat) return;
    const items   = cat.querySelector('.ch-cat-items');
    const chevron = cat.querySelector('.ch-cat-chevron');
    const open    = !items.classList.contains('hidden');
    items.classList.toggle('hidden', open);
    chevron.textContent = open ? '▶' : '▼';

    // Persist open state
    const openCats = new Set(JSON.parse(localStorage.getItem('chOpenCats') || '[]'));
    open ? openCats.delete(catId) : openCats.add(catId);
    localStorage.setItem('chOpenCats', JSON.stringify([...openCats]));
  }

  _expandCategory(catId) {
    const cat = this.challengeList?.querySelector(`.ch-category[data-cat="${catId}"]`);
    if (!cat) return;
    cat.querySelector('.ch-cat-items')?.classList.remove('hidden');
    const chevron = cat.querySelector('.ch-cat-chevron');
    if (chevron) chevron.textContent = '▼';
  }

  // ── Exercise Panel ────────────────────────────────────────────────────────

  loadExercise(exerciseId) {
    // Save the current exercise's code before switching away
    if (this.currentExercise && this.currentExercise.id !== exerciseId) {
      this._saveCodeForExercise(this.currentExercise.id, this.editor.getValue());
    }

    const ex = EXERCISES.find(e => e.id === exerciseId);
    if (!ex) return;
    this.currentExercise = ex;

    const done      = !!this.progress.completed?.[ex.id];
    const diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[ex.difficulty];
    const diffClass = `badge-${ex.difficulty}`;

    if (this.panelTitle) this.panelTitle.textContent = ex.title;
    if (this.panelBadge) {
      this.panelBadge.textContent  = diffLabel;
      this.panelBadge.className    = `ch-difficulty-badge ${diffClass}`;
    }
    if (this.panelBody) {
      const hints = ex.hints.length
        ? `<details class="ch-hints"><summary>Show hints</summary><ul>${ex.hints.map(h => `<li>${escHtml(h)}</li>`).join('')}</ul></details>`
        : '';
      this.panelBody.innerHTML = `<div class="ch-desc">${formatDesc(ex.description)}</div>${hints}`;
    }
    if (this.testResults) this.testResults.innerHTML = '';

    // Load the student's saved code for this exercise, or starter code, or blank.
    // If saved code begins with the prelude (e.g. from before the prelude was hidden),
    // strip it so the student only sees their own code.
    let savedSource = this.progress.submissions?.[exerciseId]?.source;
    if (savedSource !== undefined && ex.prelude) {
      // Remove any prelude lines that crept into the saved code (e.g. from old starter code)
      const preludeLines = new Set(ex.prelude.split('\n').map(l => l.trim()).filter(Boolean));
      savedSource = savedSource.split('\n').filter(l => !preludeLines.has(l.trim())).join('\n').trim();
    }
    if (savedSource !== undefined) {
      this.editor.setValue(savedSource);
    } else if (ex.starterCode) {
      this.editor.setValue(ex.starterCode);
    } else {
      this.editor.setValue('');
    }

    this._showChallengePanel();
    if (this.onExerciseLoad) this.onExerciseLoad(ex.title);

    // Highlight active item in sidebar
    this.challengeList?.querySelectorAll('.ch-item').forEach(el => {
      el.classList.toggle('ch-item--active', el.dataset.id === exerciseId);
    });
  }

  // ── Test Runner ────────────────────────────────────────────────────────────

  async runTests() {
    if (!this.currentExercise) return;
    const ex     = this.currentExercise;
    const source = this.editor.getValue();

    if (!source.trim()) {
      if (this.testResults) this.testResults.innerHTML = '<div class="ch-test-empty">Write some code first!</div>';
      return;
    }

    // Always save the current code before running tests
    this._saveCodeForExercise(ex.id, source);

    if (this.testResults) this.testResults.innerHTML = '<div class="ch-test-running">Running…</div>';

    // Exercises with no automated tests — award XP on submit and prompt student to verify manually
    if (ex.tests.length === 0) {
      this.testResults.innerHTML = '<div class="ch-test-empty">No automated tests for this exercise — run your code and check the output to verify your solution.</div>';
      if (!this.progress.completed?.[ex.id]) {
        await this._awardXP(ex);
      }
      return;
    }

    // Declaration check — fail immediately if any variable is used without DECLARE
    const undeclaredVars = checkUndeclaredVariables(source);
    if (undeclaredVars.length > 0) {
      this.testResults.innerHTML = `
        <div class="ch-tr-summary ch-tr-summary--fail">Tests not run</div>
        <div class="ch-warnings ch-warnings--error">
          <strong>Missing declarations:</strong>
          <ul>${undeclaredVars.map(v => `<li><code>${escHtml(v)}</code> is used but not declared with <code>DECLARE</code></li>`).join('')}</ul>
          <p style="margin:6px 0 0">All variables must be declared before use using <code>DECLARE VarName : TYPE</code>.</p>
        </div>`;
      return;
    }

    // Source-form check — e.g. exercises that require function-call form rather than operator
    if (ex.sourceCheck) {
      const sourceErr = ex.sourceCheck(source);
      if (sourceErr) {
        this.testResults.innerHTML = `
          <div class="ch-tr-summary ch-tr-summary--fail">Tests not run</div>
          <div class="ch-warnings ch-warnings--error"><strong>Incorrect form:</strong> ${escHtml(sourceErr)}</div>`;
        return;
      }
    }


    // Build execution source: if a prelude exists, run student DECLAREs first,
    // then the prelude (e.g. array population), then the rest of the student's code.
    // This ensures arrays are declared before the prelude tries to populate them.
    // Any FOR...NEXT block in the student's code that contains RANDOM() is stripped
    // so the prelude's fixed data is not overwritten during test execution.
    let execSource;
    let preludeLineOffset = 0;
    if (ex.prelude) {
      const lines = source.split('\n');
      const declLines = lines.filter(l => /^\s*DECLARE\b/i.test(l));
      const restLines = lines.filter(l => !/^\s*DECLARE\b/i.test(l));
      const strippedRest = ex.stripRandomLoops ? _stripRandomLoops(restLines) : restLines;
      execSource = [...declLines, ex.prelude, ...strippedRest].join('\n');
      preludeLineOffset = ex.prelude.split('\n').length;
    } else {
      execSource = source;
    }

    const results = [];
    const runOpts = { relaxedIdentifiers: ex.category === 'exam' };

    // Run the first test to detect whether the student used INPUT at all
    if (ex.tests.length > 0) {
      const r0 = await this._runSingleTest(execSource, ex.tests[0], 1, runOpts, preludeLineOffset);
      results.push(r0);

      // If no INPUT was used, the code has hardcoded values — only check test 1
      // (further tests with different inputs would all produce the same output)
      if (r0.inputsConsumed) {
        for (const [idx, test] of ex.tests.slice(1).entries()) {
          results.push(await this._runSingleTest(execSource, test, idx + 2, runOpts, preludeLineOffset));
        }
      }
    }

    // Required variable check — only when there are automated tests to run
    const allPassed = results.every(r => r.passed);
    this._renderTestResults(results, allPassed);

    if (allPassed && !this.progress.completed?.[ex.id]) {
      await this._awardXP(ex);
    }
  }

  async _runSingleTest(source, test, testNum, runOpts = {}, preludeLineOffset = 0) {
    const interp  = new Interpreter();
    const outputs = [];
    interp.onOutput = text => outputs.push(String(text));
    interp.setInputQueue([...(test.inputs ?? [])]);

    try {
      await interp.run(source, runOpts);
    } catch (e) {
      const dataOutputs = outputs.filter((_, i) => !interp._promptIndices.has(i));
      const msg = preludeLineOffset > 0
        ? (e.message ?? String(e)).replace(/\bLine (\d+)/g, (_, n) => {
            const adjusted = parseInt(n, 10) - preludeLineOffset;
            return `Line ${adjusted > 0 ? adjusted : parseInt(n, 10)}`;
          })
        : (e.message ?? String(e));
      return {
        passed:         false,
        testNum,
        inputs:         test.inputs,
        expected:       test.expected,
        got:            dataOutputs,
        error:          msg,
        snapshot:       interp.globalEnv?.snapshot?.() ?? {},
        inputsConsumed: interp._inputsConsumed
      };
    }

    // Strip prompt candidates (last output before each INPUT) only if the line
    // doesn't appear in the expected output. This preserves loop feedback like
    // "Too low"/"Too high" (which are expected) while removing genuine prompts
    // like "Enter a number: " (which are not expected).
    const expectedSet = new Set(test.expected);
    const dataOutputs = outputs.filter((line, i) =>
      !interp._promptIndices.has(i) || expectedSet.has(line)
    );
    const passed = arraysEqual(dataOutputs, test.expected);
    return { passed, testNum, inputs: test.inputs, expected: test.expected, got: dataOutputs, error: null, snapshot: interp.globalEnv?.snapshot?.() ?? {}, inputsConsumed: interp._inputsConsumed };
  }

  _renderTestResults(results, allPassed) {
    if (!this.testResults) return;

    const rows = results.map(r => {
      const icon     = r.passed ? '✓' : '✗';
      const cls      = r.passed ? 'ch-tr--pass' : 'ch-tr--fail';
      const inputStr = r.inputs?.length ? `<div class="ch-tr-detail"><span>Inputs:</span> ${escHtml(r.inputs.join(', '))}</div>` : '';
      const expStr   = `<div class="ch-tr-detail"><span>Expected:</span> ${escHtml(fmtOutputArray(r.expected))}</div>`;
      const gotStr   = r.passed ? '' : `<div class="ch-tr-detail ch-tr-got"><span>Got:</span> ${escHtml(fmtOutputArray(r.got))}</div>`;
      const errStr   = r.error  ? `<div class="ch-tr-detail ch-tr-err"><span>Error:</span> ${escHtml(r.error)}</div>` : '';
      return `<div class="ch-test-row ${cls}">
        <span class="ch-tr-icon">${icon}</span>
        <div class="ch-tr-body">
          <div class="ch-tr-label">Test ${r.testNum}</div>
          ${inputStr}${expStr}${gotStr}${errStr}
        </div>
      </div>`;
    }).join('');

    const summary = allPassed
      ? `<div class="ch-tr-summary ch-tr-summary--pass">All ${results.length} test${results.length > 1 ? 's' : ''} passed!</div>`
      : `<div class="ch-tr-summary ch-tr-summary--fail">${results.filter(r=>r.passed).length} / ${results.length} tests passed</div>`;

    this.testResults.innerHTML = summary + rows;
  }

  // ── Code persistence ──────────────────────────────────────────────────────

  _saveCodeForExercise(exerciseId, source) {
    if (!this.uid || !exerciseId) return;
    if (!this.progress.submissions) this.progress.submissions = {};
    const existing = this.progress.submissions[exerciseId] ?? {};
    this.progress.submissions[exerciseId] = {
      ...existing,
      source,
      savedAt: Date.now()
    };
    // Persist to Firestore (fire-and-forget)
    saveChallengeProgress(this.uid, this.progress).catch(e =>
      console.warn('Could not save challenge code:', e)
    );
  }

  // ── XP & Badges ───────────────────────────────────────────────────────────

  async _awardXP(ex) {
    if (!this.uid) return;
    const newBadges = [];

    // Mark complete
    if (!this.progress.completed) this.progress.completed = {};
    this.progress.completed[ex.id] = { completedAt: Date.now(), xp: ex.xp };
    // Mark submission as passed
    if (this.progress.submissions?.[ex.id]) {
      this.progress.submissions[ex.id].passed = true;
    }
    this.progress.totalXP = (this.progress.totalXP ?? 0) + ex.xp;

    const totalDone = Object.keys(this.progress.completed).length;

    // Check badges
    for (const badge of BADGES) {
      if (this.progress.badges?.includes(badge.id)) continue;

      let earned = false;
      if (badge.type === 'total') {
        earned = totalDone >= badge.threshold;
      } else if (badge.type === 'xp') {
        earned = this.progress.totalXP >= badge.threshold;
      } else if (badge.category) {
        const catExercises = EXERCISES.filter(e => e.category === badge.category);
        earned = catExercises.every(e => this.progress.completed[e.id]);
      }

      if (earned) {
        if (!this.progress.badges) this.progress.badges = [];
        this.progress.badges.push(badge.id);
        newBadges.push(badge);
      }
    }

    // Save progress + update leaderboard
    try {
      await saveChallengeProgress(this.uid, this.progress);
    } catch (e) {
      console.error('Failed to save challenge progress:', e);
    }
    if (this.role === 'student' && this.classCode) {
      updateLeaderboard(this.uid, {
        displayName:    this._displayName,
        classCode:      this.classCode,
        role:           'student',
        totalXP:        this.progress.totalXP,
        completedCount: Object.keys(this.progress.completed).length,
        level:          this._level(),
        badgeCount:     (this.progress.badges ?? []).length
      }).catch(e => console.warn('Leaderboard update failed:', e));
    }

    // Update UI
    this.renderSidebar();
    this._updateXpDisplay();
    this._updateDoneState(ex.id);
    if (this.onXpChange) this.onXpChange(this.progress.totalXP, this._level());

    // Toast for XP
    this._showXpToast(ex.xp, ex.title);

    // Toast for badges (one at a time)
    for (const badge of newBadges) {
      await delay(800);
      this._showBadgeToast(badge);
    }
  }

  _level() {
    return Math.floor((this.progress.totalXP ?? 0) / 100) + 1;
  }

  _updateXpDisplay() {
    const xp    = this.progress.totalXP ?? 0;
    const level = this._level();
    const xpInLevel      = xp % 100;
    const pct            = xpInLevel;

    if (this.xpDisplay) this.xpDisplay.textContent = `${xp} XP`;
    if (this.levelDisplay) this.levelDisplay.textContent = `Level ${level}`;

    const bar = $('ch-xp-bar-fill');
    if (bar) bar.style.width = `${pct}%`;
  }

  _updateDoneState(exerciseId) {
    const item = this.challengeList?.querySelector(`[data-id="${exerciseId}"]`);
    if (item) {
      item.classList.add('ch-item--done');
      item.querySelector('.ch-item-status').textContent = '✓';
    }
  }

  _showXpToast(xp, title) {
    const toast = $('xp-toast');
    if (!toast) return;
    toast.textContent = `+${xp} XP — ${title}`;
    toast.classList.remove('hidden');
    toast.classList.add('toast-show');
    setTimeout(() => { toast.classList.remove('toast-show'); toast.classList.add('hidden'); }, 2800);
  }

  _showBadgeToast(badge) {
    const toast = this.badgeToast;
    if (!toast) return;
    toast.innerHTML = `<span class="badge-toast-icon">🏅</span><span><strong>${badge.label}</strong><br>${badge.desc}</span>`;
    toast.classList.remove('hidden');
    toast.classList.add('toast-show');
    setTimeout(() => { toast.classList.remove('toast-show'); toast.classList.add('hidden'); }, 3500);
  }

  // ── Panel show/hide ────────────────────────────────────────────────────────

  _showChallengePanel() {
    this.challengePanel?.classList.remove('hidden');
  }

  _hideChallengePanel() {
    this.challengePanel?.classList.add('hidden');
    this.currentExercise = null;
    this.challengeList?.querySelectorAll('.ch-item--active').forEach(el => el.classList.remove('ch-item--active'));
    if (this.onExerciseLoad) this.onExerciseLoad(null);
  }

  _bindPanelEvents() {
    this.closePanelBtn?.addEventListener('click', () => this._hideChallengePanel());

    $('btn-leaderboard')?.addEventListener('click', () => this.showLeaderboard());
    $('leaderboard-modal')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) this._hideLeaderboard();
    });
    $('btn-close-leaderboard')?.addEventListener('click', () => this._hideLeaderboard());
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────

  async showLeaderboard(classCodeOverride) {
    const modal = $('leaderboard-modal');
    const body  = $('leaderboard-body');
    if (!modal || !body) return;

    body.innerHTML = '<div class="lb-loading">Loading…</div>';
    modal.classList.remove('hidden');

    try {
      // Teachers have no classCode — let them pick from available classes
      if (!this.classCode && !classCodeOverride) {
        const all     = await getAllLeaderboardEntries();
        const classes = [...new Set(all.map(e => e.classCode).filter(Boolean))].sort();
        if (!classes.length) {
          body.innerHTML = '<div class="lb-empty">No leaderboard entries yet.</div>';
          return;
        }
        body.innerHTML = `
          <div style="padding:12px 16px;font-size:13px;color:var(--text-secondary)">Select a class to view its leaderboard:</div>
          ${classes.map(c => `<div class="lb-row" style="cursor:pointer" data-class="${escHtml(c)}">
            <span class="lb-rank">📋</span>
            <span class="lb-name">${escHtml(c)}</span>
            <span class="lb-done">${all.filter(e => e.classCode === c).length} students</span>
          </div>`).join('')}`;
        body.querySelectorAll('[data-class]').forEach(row => {
          row.addEventListener('click', () => this.showLeaderboard(row.dataset.class));
        });
        return;
      }

      const code = classCodeOverride || this.classCode;
      const rows = await getClassLeaderboard(code);
      if (!rows.length) {
        body.innerHTML = '<div class="lb-empty">No entries yet for this class.</div>';
        return;
      }

      const medals = ['🥇','🥈','🥉'];
      const backBtn = !this.classCode
        ? `<div style="padding:8px 16px"><button style="font-size:12px;background:none;border:none;cursor:pointer;color:var(--accent)" id="lb-back-btn">← All classes</button></div>`
        : '';
      body.innerHTML = backBtn + rows.map((r, i) => {
        const isMe = r.uid === this.uid;
        const rank = medals[i] ?? `${i + 1}`;
        return `<div class="lb-row${isMe ? ' lb-row--me' : ''}">
          <span class="lb-rank">${rank}</span>
          <span class="lb-name">${escHtml(r.displayName ?? 'Student')}</span>
          <span class="lb-level">Lv.${r.level ?? 1}</span>
          <span class="lb-xp">${r.totalXP ?? 0} XP</span>
          <span class="lb-done">${r.completedCount ?? 0} done</span>
        </div>`;
      }).join('');
      body.querySelector('#lb-back-btn')?.addEventListener('click', () => this.showLeaderboard());
    } catch (e) {
      body.innerHTML = `<div class="lb-empty">Could not load leaderboard.</div>`;
      console.error('Leaderboard fetch failed:', e);
    }
  }

  _hideLeaderboard() {
    $('leaderboard-modal')?.classList.add('hidden');
  }

  // ── Public helpers ─────────────────────────────────────────────────────────

  getProgress() {
    return {
      totalXP:   this.progress.totalXP ?? 0,
      completed: new Set(Object.keys(this.progress.completed ?? {})),
      badges:    [...(this.progress.badges ?? [])],
      level:     this._level(),
    };
  }

  isActive() { return !!this.currentExercise; }
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function normaliseOutput(s) {
  // Strip a leading currency symbol so e.g. "$6.28" matches "6.28"
  return String(s ?? '').replace(/^[$£€]/, '').trim();
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (normaliseOutput(a[i]) !== normaliseOutput(b[i])) return false;
  }
  return true;
}

// ── IGCSE keywords/built-ins that are NOT variable names ─────────────────────
const _IGCSE_NONVARS = new Set([
  'DECLARE','CONSTANT','IF','THEN','ELSE','ENDIF','CASE','OF','OTHERWISE','ENDCASE',
  'FOR','TO','STEP','NEXT','WHILE','DO','ENDWHILE','REPEAT','UNTIL',
  'PROCEDURE','ENDPROCEDURE','CALL','FUNCTION','ENDFUNCTION','RETURNS','RETURN',
  'BYREF','BYVALUE','OPENFILE','READFILE','WRITEFILE','CLOSEFILE','READ','WRITE','APPEND',
  'INPUT','OUTPUT','AND','OR','NOT','MOD','DIV','TRUE','FALSE',
  'INTEGER','REAL','STRING','BOOLEAN','CHAR','ARRAY','OF',
  'LENGTH','LCASE','UCASE','SUBSTRING','ROUND','RANDOM','EOF',
  'TO_STRING','TO_INTEGER','TO_REAL',
]);

// Check that every variable assigned or input has been declared with DECLARE.
// Returns array of undeclared variable names.
export function checkUndeclaredVariables(source) {
  const declared = new Set();
  const used     = new Set();

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;

    // DECLARE Name : TYPE  or  DECLARE Name1, Name2 : TYPE
    const declMatch = line.match(/^DECLARE\s+(.+?)\s*:/i);
    if (declMatch) {
      declMatch[1].split(',').forEach(p => {
        const n = p.trim();
        if (n) declared.add(n.toUpperCase());
      });
      continue;
    }

    // CONSTANT Name = value
    const constMatch = line.match(/^CONSTANT\s+([A-Za-z_][A-Za-z0-9_]*)/i);
    if (constMatch) { declared.add(constMatch[1].toUpperCase()); continue; }

    // FOR counter <- ... (counter is implicitly declared by FOR)
    const forMatch = line.match(/^FOR\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:<-|←)/i);
    if (forMatch) { declared.add(forMatch[1].toUpperCase()); }

    // FUNCTION / PROCEDURE parameter names
    const paramMatch = line.match(/(?:FUNCTION|PROCEDURE)\s+\w+\s*\(([^)]*)\)/i);
    if (paramMatch) {
      paramMatch[1].split(',').forEach(p => {
        const parts = p.trim().split(/\s+/);
        // "BYREF Name : TYPE" or "Name : TYPE"
        const nameIdx = parts[0].toUpperCase() === 'BYREF' || parts[0].toUpperCase() === 'BYVALUE' ? 1 : 0;
        const name = parts[nameIdx]?.replace(/:$/, '');
        if (name) declared.add(name.toUpperCase());
      });
    }

    // Collect used identifiers: Name <- / Name ← / INPUT Name
    const assignMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:<-|←)/);
    if (assignMatch) used.add(assignMatch[1].toUpperCase());

    const inputMatch = line.match(/^INPUT\s+([A-Za-z_][A-Za-z0-9_]*)/i);
    if (inputMatch) used.add(inputMatch[1].toUpperCase());
  }

  // Anything used but not declared (and not a keyword/builtin)
  return [...used]
    .filter(n => !declared.has(n) && !_IGCSE_NONVARS.has(n))
    .map(n => {
      // Return original-case version by scanning source
      const m = source.match(new RegExp(`\\b(${n})\\b`, 'i'));
      return m ? m[1] : n;
    });
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Format an array of expected/got values for display.
// Single-character strings are shown with single quotes (CHAR notation);
// all other strings use double quotes (STRING notation).
function fmtOutputArray(arr) {
  const items = arr.map(v => {
    if (typeof v === 'string' && v.length === 1) return `'${v}'`;
    return JSON.stringify(v);
  });
  return '[' + items.join(', ') + ']';
}

// Convert plain-text description (with • bullets, backtick code, *italic*, **bold**)
// into safe HTML for display in the challenge panel.
function formatDesc(raw) {
  function inline(text) {
    // Process code spans first (preserving their content), then bold/italic
    const parts = escHtml(text).split(/(`[^`]+`)/g);
    return parts.map((p, i) => {
      if (i % 2 === 1) return '<code>' + p.slice(1, -1) + '</code>';
      return p
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g,     '<em>$1</em>');
    }).join('');
  }

  const blocks = String(raw ?? '').trim().split(/\n{2,}/);
  return blocks.map(block => {
    const lines = block.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('•')) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${inline(trimmed.slice(1).trim())}</li>`;
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p>${inline(trimmed)}</p>`;
      }
    }
    if (inList) html += '</ul>';
    return html;
  }).join('');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
