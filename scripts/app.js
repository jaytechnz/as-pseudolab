// ─── App Controller ───────────────────────────────────────────────────────────

import { onAuth, signIn, registerUser, signOutUser, updateUserClassCode, resetPassword } from './auth.js';
import { Interpreter, RuntimeError }                 from './interpreter.js';
import { Editor }                                    from './editor.js';
import { renderDashboard, revalidateAllSubmissions, refreshDashboard }  from './dashboard.js';
import { ChallengeManager }                          from './challenges.js';
import { initSuggestions, teardownSuggestions, setupSuggestionsUI } from './suggestions.js';
import {
  saveNewProgram, updateProgram, loadProgram,
  listPrograms, deleteProgram, renameProgram,
  saveSession
} from './storage.js';

const $ = id => document.getElementById(id);

// ── DOM refs ──────────────────────────────────────────────────────────────────

const loginPage        = $('login-page');
const appEl            = $('app');

const signInForm       = $('signin-form');
const signUpForm       = $('signup-form');
const authTabs         = document.querySelectorAll('.auth-tab');
const loginError       = $('signin-error');
const registerError    = $('signup-error');

const userNameEl       = $('user-name-display');
const userRoleBadge    = $('user-role-badge');
const signOutBtn       = $('btn-logout');
const dashboardBtn     = $('btn-dashboard');

const newProgramBtn    = $('btn-new-program');
const programList      = $('program-list');
const importBtn        = $('btn-import-txt');
const exportBtn        = $('btn-export-txt');
const fileInputTxt     = $('file-input-txt');

const runBtn           = $('btn-run');
const debugBtn         = $('btn-debug');
const stepBtn          = $('btn-step');
const continueBtn      = $('btn-continue');
const stopBtn          = $('btn-stop');
const saveBtn          = $('btn-save');
const saveStatus       = $('save-status');
const clearBpBtn       = $('btn-clear-breakpoints');

const editorTextarea   = $('code-editor');
const editorHighlight  = $('editor-highlight');
const editorGutter     = $('editor-gutter');
const programTitleEl   = $('program-title-display');
const tabFilename      = $('tab-filename');
const tabDirty         = $('tab-dirty');

const outputConsole    = $('output-console');
const errorsPanel      = $('output-errors');
const errorBadge       = $('error-badge');
const filesPanel       = $('output-files');
const outputTabs       = document.querySelectorAll('.output-tab');
const clearOutputBtn   = $('btn-clear-output');

const debugPanel       = $('debug-side-panel');
const variableWatch    = $('variable-watch');
const debugCurrentLine = $('debug-current-line');
const debugStatus      = $('debug-status');
const debugSteps       = $('debug-steps');
const virtualFiles     = $('virtual-files');

const renameModal      = $('rename-modal');
const renameInput      = $('rename-input');
const renameConfirm    = $('rename-confirm');
const renameCancel     = $('rename-cancel');

const teacherDash      = $('teacher-dashboard');
const closeDashBtn     = $('btn-close-dashboard');
const dashboardGrid    = $('dashboard-grid');

const themeToggleBtn   = $('btn-theme');
const themeIconDark    = $('theme-icon-dark');
const themeIconLight   = $('theme-icon-light');
const themeLabel       = $('theme-label');

const fontToggleBtn    = $('btn-font');
const refPanelBtn      = $('btn-ref-panel');
const refPanel         = $('ref-panel');
const refCloseBtn      = $('btn-close-ref');
const explorerBtn      = $('btn-explorer');
const explorerCloseBtn = $('btn-close-explorer');

const statusBar        = document.querySelector('.status-bar');
const statusLineCol    = $('status-line-col');
const statusExecState  = $('status-exec-state');
const statusClassCode  = $('status-class-code');
const classCodeBtn     = $('btn-class-code');
const classModal       = $('class-modal');
const classInput       = $('class-input');
const classConfirm     = $('class-confirm');
const classCancel      = $('class-cancel');

const outputPanel      = $('output-panel');
const resizeHandle     = $('panel-resize-handle');

const sidebar          = $('sidebar');
const tabPrograms      = $('tab-programs');
const tabChallenges    = $('tab-challenges');
const sidebarProgView  = $('sidebar-programs-view');
const sidebarChalView  = $('sidebar-challenges-view');

// ── State ─────────────────────────────────────────────────────────────────────

let currentUser      = null;
let currentProfile   = null;
let currentProgramId = null;
let currentTitle     = 'Untitled Program';
let isDirty          = false;
let isRunning        = false;
let runStartTime     = 0;
let stepCount        = 0;

const interp = new Interpreter();
const editor = new Editor({
  textarea:  editorTextarea,
  highlight: editorHighlight,
  gutter:    editorGutter
});

const challenges = new ChallengeManager({
  editor,
  appendOutput,
  clearOutput,
  onXpChange: (xp, level) => { /* XP display is updated inside ChallengeManager */ },
  onExerciseLoad: (title) => {
    if (title) {
      // Show exercise title in tab — no .pseudo extension, no dirty indicator
      if (tabFilename)   tabFilename.textContent = title;
      if (tabDirty)      tabDirty.classList.add('hidden');
      if (programTitleEl) programTitleEl.textContent = title;
      clearOutput();
    } else {
      // Exercise closed — restore program title
      setTitle(currentTitle);
      updateTabState();
    }
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

onAuth(async (user, profile) => {
  currentUser    = user;
  currentProfile = profile;

  if (!user) { teardownSuggestions(); show(loginPage); hide(appEl); return; }

  hide(loginPage);
  show(appEl);

  const isSuperAdmin = profile?.role === 'superadmin';
  const isTeacher    = profile?.role === 'teacher' || isSuperAdmin;
  const isStudent    = profile?.role === 'student';

  if (userNameEl) userNameEl.textContent = profile?.displayName ?? user.email;
  if (userRoleBadge) {
    if (isSuperAdmin) {
      userRoleBadge.textContent = 'Super Admin';
      userRoleBadge.classList.add('role-badge--superadmin');
    } else {
      userRoleBadge.classList.remove('role-badge--superadmin');
      userRoleBadge.textContent = profile?.role === 'teacher' ? 'Teacher' : 'Student';
    }
  }

  dashboardBtn?.classList.toggle('hidden', !isTeacher);

  initSuggestions(user, profile);

  // Show class code button for students
  classCodeBtn?.classList.toggle('hidden', !isStudent);
  if (isStudent) {
    document.querySelectorAll('.student-only').forEach(el => el.classList.remove('hidden'));
    updateClassDisplay(profile?.classCode);
  }

  await refreshProgramList();
  newProgram();

  // Init challenge system for all users
  await challenges.init(user.uid, profile?.classCode ?? '', profile?.displayName ?? user.email, profile?.role ?? 'student');
});

// Password show/hide toggles
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = $(btn.dataset.target);
    if (!input) return;
    const showing = input.classList.toggle('pw-masked');
    btn.querySelector('.pw-eye')?.classList.toggle('hidden', showing);
    btn.querySelector('.pw-eye-off')?.classList.toggle('hidden', !showing);
    btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });
});

authTabs?.forEach(tab => {
  tab.addEventListener('click', () => {
    authTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    signInForm?.classList.toggle('active', target === 'signin');
    signUpForm?.classList.toggle('active', target === 'signup');
    clearAuthError(loginError);
    clearAuthError(registerError);
  });
});

signInForm?.addEventListener('submit', async e => {
  e.preventDefault();
  clearAuthError(loginError);
  try { await signIn($('signin-email').value.trim(), $('signin-password').value); }
  catch (err) { showAuthError(loginError, friendlyAuthError(err)); }
});

const resetPanel     = $('reset-panel');
const resetEmailInput = $('reset-email');
const resetError     = $('reset-error');

$('forgot-password-btn')?.addEventListener('click', () => {
  resetEmailInput.value = $('signin-email')?.value ?? '';
  clearAuthError(resetError);
  resetPanel?.classList.remove('hidden');
  resetEmailInput?.focus();
});

const _closeReset = () => { resetPanel?.classList.add('hidden'); clearAuthError(resetError); };
$('reset-cancel-btn')?.addEventListener('click', _closeReset);
resetPanel?.addEventListener('click', e => { if (e.target === resetPanel) _closeReset(); });

$('reset-submit-btn')?.addEventListener('click', async () => {
  const email = resetEmailInput.value.trim();
  if (!email) {
    showAuthError(resetError, 'Please enter your email address.');
    return;
  }
  clearAuthError(resetError);
  $('reset-submit-btn').disabled = true;
  try {
    await resetPassword(email);
    resetError.textContent = `Reset link sent to ${email}. Check your inbox.`;
    resetError.classList.remove('hidden');
    resetError.style.color = 'var(--accent)';
    resetError.style.background = 'rgba(0,128,157,0.12)';
    resetError.style.borderColor = 'var(--accent)';
    setTimeout(() => resetPanel?.classList.add('hidden'), 4000);
  } catch (err) {
    showAuthError(resetError, friendlyAuthError(err));
  } finally {
    $('reset-submit-btn').disabled = false;
  }
});

signUpForm?.addEventListener('submit', async e => {
  e.preventDefault();
  clearAuthError(registerError);
  try {
    await registerUser(
      $('signup-email').value.trim(),
      $('signup-password').value,
      $('signup-name').value.trim(),
      $('signup-classcode')?.value ?? ''
    );
  }
  catch (err) { showAuthError(registerError, friendlyAuthError(err)); }
});

signOutBtn?.addEventListener('click', async () => {
  if (!confirmDirty()) return;
  challenges.reset();
  teardownSuggestions();
  await signOutUser();
});

// ── Sidebar tabs (Programs / Challenges) ──────────────────────────────────────

function setSidebarView(view) {
  const isChallenge = view === 'challenges';
  tabPrograms?.classList.toggle('active', !isChallenge);
  tabChallenges?.classList.toggle('active', isChallenge);
  sidebarProgView?.classList.toggle('hidden', isChallenge);
  sidebarChalView?.classList.toggle('hidden', !isChallenge);
  // Hide "+ New" button when challenges view is active
  const newBtn = $('btn-new-program');
  newBtn?.classList.toggle('hidden', isChallenge);
  // Hide program title in challenges mode; restore it in programs mode
  if (programTitleEl) programTitleEl.classList.toggle('hidden', isChallenge);
  localStorage.setItem('sidebarView', view);
}

tabPrograms?.addEventListener('click',   () => setSidebarView('programs'));
tabChallenges?.addEventListener('click', () => {
  setSidebarView('challenges');
  challenges.renderSidebar();  // always re-render on tab open
});

// Restore last view
(function restoreSidebarView() {
  const saved = localStorage.getItem('sidebarView') ?? 'programs';
  setSidebarView(saved);
})();

function showAuthError(el, msg) { if (!el) return; el.textContent = msg; el.classList.remove('hidden'); }
function clearAuthError(el)     { if (!el) return; el.textContent = ''; el.classList.add('hidden'); }

function friendlyAuthError(err) {
  const c = err.code ?? '';
  if (c.includes('user-not-found') || c.includes('wrong-password') || c.includes('invalid-credential'))
    return 'Incorrect email or password.';
  if (c.includes('email-already-in-use')) return 'An account with this email already exists.';
  if (c.includes('weak-password'))        return 'Password must be at least 6 characters.';
  if (c.includes('network'))              return 'Network error — check your connection.';
  return err.message ?? 'Authentication failed.';
}

// ══════════════════════════════════════════════════════════════════════════════
// PROGRAM MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

async function refreshProgramList() {
  if (!currentUser) return;
  programList.innerHTML = '<div class="program-list-empty">Loading…</div>';
  try {
    renderProgramList(await listPrograms(currentUser.uid));
  } catch (err) {
    console.error('listPrograms failed:', err);
    programList.innerHTML = `<div class="program-list-empty">Failed to load programs.<br><small style="opacity:0.7">${escHtml(err.message ?? String(err))}</small></div>`;
  }
}

function renderProgramList(programs) {
  if (!programs.length) {
    programList.innerHTML = '<div class="program-list-empty">No saved programs yet.<br>Click <strong>+ New</strong> to start.</div>';
    return;
  }
  programList.innerHTML = programs.map(p => `
    <div class="program-item ${p.id === currentProgramId ? 'active' : ''}" data-id="${p.id}">
      <span class="program-item-name">${escHtml(p.title)}</span>
      <span class="program-item-actions">
        <button class="prog-rename icon-btn" data-id="${p.id}" title="Rename">✎</button>
        <button class="prog-delete icon-btn" data-id="${p.id}" title="Delete">✕</button>
      </span>
    </div>`).join('');

  programList.querySelectorAll('.program-item').forEach(el => {
    el.addEventListener('click', async e => {
      if (e.target.closest('button')) return;
      if (!confirmDirty()) return;
      await openProgram(el.dataset.id);
    });
  });
  programList.querySelectorAll('.prog-rename').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); showRenameModal(btn.dataset.id); });
  });
  programList.querySelectorAll('.prog-delete').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('Delete this program? This cannot be undone.')) return;
      await deleteProgram(btn.dataset.id);
      if (btn.dataset.id === currentProgramId) newProgram();
      await refreshProgramList();
    });
  });
}

function newProgram() {
  currentProgramId = null;
  currentTitle     = 'Untitled Program';
  isDirty          = false;
  editor.setValue('');
  setTitle('Untitled Program');
  setSaveStatus('');
  clearOutput();
  updateTabState();
}

async function openProgram(id) {
  const prog = await loadProgram(id);
  if (!prog) return;
  currentProgramId = id;
  currentTitle     = prog.title;
  isDirty          = false;
  editor.setValue(prog.source ?? '');
  setTitle(prog.title);
  setSaveStatus('');
  clearOutput();
  updateTabState();
  renderProgramList(await listPrograms(currentUser.uid));
}

async function saveProgram() {
  if (!currentUser) { showSaveError('Not signed in'); return; }
  const source = editor.getValue();
  let title = currentTitle.replace(/^\* /, '');

  // Require a real title — cannot save as "Untitled Program"
  if (!title || title === 'Untitled Program') {
    const given = prompt('Please enter a name for this program before saving:');
    if (!given?.trim()) return; // user cancelled
    title = given.trim();
    setTitle(title);
  }

  setSaveStatus('Saving…');
  saveStatus?.classList.remove('error');
  try {
    if (!currentProgramId) {
      currentProgramId = await saveNewProgram(currentUser.uid, { title, source });
    } else {
      await updateProgram(currentProgramId, { title, source });
    }
    isDirty = false;
    setTitle(title);
    setSaveStatus('✓ Saved');
    updateTabState();
    setTimeout(() => setSaveStatus(''), 2500);
    await refreshProgramList();
  } catch (e) {
    showSaveError('Save failed: ' + (e.message ?? e));
  }
}

function showSaveError(msg) {
  if (saveStatus) { saveStatus.textContent = msg; saveStatus.classList.add('error'); }
}

function setTitle(title) {
  currentTitle = title;
  if (challenges.isActive()) return; // exercise title is managed by onExerciseLoad
  const display = title === 'Untitled Program' ? '' : title;
  if (programTitleEl) programTitleEl.textContent = display;
  if (tabFilename)    tabFilename.textContent = display ? display + '.pseudo' : '';
}

function setSaveStatus(text) { if (saveStatus) saveStatus.textContent = text; }

function updateTabState() {
  if (tabDirty) tabDirty.classList.toggle('hidden', !isDirty);
}

editor.onChange(() => {
  if (challenges.isActive()) return; // challenges auto-save; no dirty state needed
  if (!isDirty) {
    isDirty = true;
    if (programTitleEl && !programTitleEl.textContent.startsWith('* ')) {
      programTitleEl.textContent = '* ' + programTitleEl.textContent;
    }
    updateTabState();
  }
});

// Update status bar line/col on cursor move
editorTextarea?.addEventListener('keyup',    updateLineCol);
editorTextarea?.addEventListener('mouseup',  updateLineCol);
editorTextarea?.addEventListener('click',    updateLineCol);

function updateLineCol() {
  const { line, col } = editor.getCursorLineCol();
  if (statusLineCol) statusLineCol.textContent = `Ln ${line}, Col ${col}`;
}

function confirmDirty() {
  if (!isDirty) return true;
  return confirm('You have unsaved changes. Continue?');
}

// ── Rename modal ──────────────────────────────────────────────────────────────

let _renameTargetId = null;

programTitleEl?.addEventListener('click', () => showTitleEditor());

function showTitleEditor() {
  _renameTargetId = currentProgramId;
  if (renameInput)  renameInput.value = currentTitle.replace(/^\* /, '');
  if (renameModal)  renameModal.classList.remove('hidden');
  renameInput?.focus();
  renameInput?.select();
}

function showRenameModal(programId) {
  _renameTargetId = programId;
  const item = programList.querySelector(`[data-id="${programId}"] .program-item-name`);
  if (renameInput) renameInput.value = item?.textContent ?? '';
  if (renameModal) renameModal.classList.remove('hidden');
  renameInput?.focus();
  renameInput?.select();
}

renameConfirm?.addEventListener('click', async () => {
  const newTitle = renameInput?.value.trim();
  if (!newTitle) return;
  renameModal?.classList.add('hidden');
  if (_renameTargetId) {
    await renameProgram(_renameTargetId, newTitle);
    if (_renameTargetId === currentProgramId) setTitle(newTitle);
    await refreshProgramList();
  } else {
    setTitle(newTitle);
    isDirty = true;
    if (programTitleEl) programTitleEl.textContent = '* ' + newTitle;
    updateTabState();
  }
});

renameCancel?.addEventListener('click', () => renameModal?.classList.add('hidden'));
renameInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter')  renameConfirm?.click();
  if (e.key === 'Escape') renameCancel?.click();
});

// ── Class code ────────────────────────────────────────────────────────────────

function updateClassDisplay(code) {
  if (statusClassCode) statusClassCode.textContent = code?.trim() || 'None';
  if (currentProfile) currentProfile.classCode = code;
}

classCodeBtn?.addEventListener('click', () => {
  if (classInput) classInput.value = currentProfile?.classCode ?? '';
  classModal?.classList.remove('hidden');
  classInput?.focus();
  classInput?.select();
});

classConfirm?.addEventListener('click', async () => {
  const code = classInput?.value.trim().toUpperCase() || '';
  if (code && !/^[A-Z0-9]{6}$/.test(code)) {
    if (classInput) {
      classInput.style.borderColor = 'var(--error)';
      classInput.title = 'Must be exactly 6 characters: capital letters and digits only';
    }
    return;
  }
  if (classInput) { classInput.style.borderColor = ''; classInput.title = ''; }
  classModal?.classList.add('hidden');
  if (!currentUser) return;
  try {
    await updateUserClassCode(currentUser.uid, code);
    updateClassDisplay(code);
  } catch (e) {
    showSaveError('Could not update class code: ' + e.message);
  }
});

classCancel?.addEventListener('click',  () => classModal?.classList.add('hidden'));
classInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter')  classConfirm?.click();
  if (e.key === 'Escape') classCancel?.click();
});

// ── Sidebar actions ───────────────────────────────────────────────────────────

newProgramBtn?.addEventListener('click', () => { if (confirmDirty()) newProgram(); });
saveBtn?.addEventListener('click', saveProgram);

importBtn?.addEventListener('click', () => fileInputTxt?.click());

fileInputTxt?.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!confirmDirty()) return;
  const text = await file.text();
  editor.setValue(text);
  setTitle(file.name.replace(/\.(txt|pseudo)$/i, ''));
  currentProgramId = null;
  isDirty = true;
  if (programTitleEl) programTitleEl.textContent = '* ' + currentTitle;
  updateTabState();
  fileInputTxt.value = '';
});

exportBtn?.addEventListener('click', () => {
  const blob = new Blob([editor.getValue()], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: (currentTitle.replace(/^\* /, '') || 'program') + '.txt' });
  a.click();
  URL.revokeObjectURL(url);
});


clearBpBtn?.addEventListener('click', () => editor.clearBreakpoints());

// ══════════════════════════════════════════════════════════════════════════════
// OUTPUT TABS
// ══════════════════════════════════════════════════════════════════════════════

outputTabs?.forEach(tab => {
  tab.addEventListener('click', () => {
    outputTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const panel = tab.dataset.panel;
    outputConsole?.classList.toggle('hidden', panel !== 'console');
    errorsPanel?.classList.toggle('hidden',   panel !== 'errors');
    filesPanel?.classList.toggle('hidden',    panel !== 'files');
  });
});

clearOutputBtn?.addEventListener('click', clearOutput);

function clearOutput() {
  if (outputConsole) outputConsole.innerHTML = '<div class="output-placeholder">Program output will appear here…</div>';
  if (errorsPanel)   errorsPanel.innerHTML   = '<div class="output-placeholder">No problems.</div>';
  if (filesPanel)    filesPanel.innerHTML    = '<div class="output-placeholder">Virtual file system contents will appear here after WRITEFILE operations.</div>';
  if (errorBadge)  { errorBadge.textContent = ''; errorBadge.classList.add('hidden'); }
  editor.clearErrorLine();
}

function switchToConsoleTab() {
  outputTabs?.forEach(t => t.classList.toggle('active', t.dataset.panel === 'console'));
  outputConsole?.classList.remove('hidden');
  errorsPanel?.classList.add('hidden');
  filesPanel?.classList.add('hidden');
}

function appendOutput(text) {
  const placeholder = outputConsole?.querySelector('.output-placeholder');
  if (placeholder) placeholder.remove();
  const line = document.createElement('div');
  line.className   = 'output-line';
  line.textContent = text;
  outputConsole?.appendChild(line);
  if (outputConsole) outputConsole.scrollTop = outputConsole.scrollHeight;
}

function showErrors(errors) {
  if (!errors.length) return;
  if (errorBadge) { errorBadge.textContent = errors.length; errorBadge.classList.remove('hidden'); }
  errorsPanel.innerHTML = errors.map(e =>
    `<div class="error-item">
       ${e.line ? `<span class="error-line">Line ${e.line}:</span> ` : ''}
       <span class="error-msg">${escHtml(e.message)}</span>
     </div>`
  ).join('');
  if (errors[0]?.line) editor.markErrorLine(errors[0].line);
  outputTabs.forEach(t => t.classList.toggle('active', t.dataset.panel === 'errors'));
  outputConsole?.classList.add('hidden');
  errorsPanel?.classList.remove('hidden');
  filesPanel?.classList.add('hidden');
}

function renderVirtualFiles(filesMap) {
  const entries = Object.entries(filesMap);
  if (virtualFiles) {
    virtualFiles.innerHTML = !entries.length
      ? '<div class="watch-empty">No open files.</div>'
      : entries.map(([name, f]) =>
          `<div class="vfile-mini"><span class="vfile-name">${escHtml(name)}</span><span class="vfile-lines">${f.lines.length}L</span></div>`
        ).join('');
  }
  if (!entries.length) return;
  filesPanel.innerHTML = entries.map(([name, f]) => `
    <div class="vfile-card">
      <div class="vfile-header">
        <span class="vfile-filename">${escHtml(name)}</span>
        <span class="vfile-mode">${f.mode ?? 'closed'}</span>
        <button class="btn-ghost btn-sm vfile-export-btn" data-name="${escHtml(name)}">Export</button>
      </div>
      <pre class="vfile-body">${escHtml(f.lines.join('\n'))}</pre>
    </div>`).join('');
  filesPanel.querySelectorAll('.vfile-export-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = interp.exportFile(btn.dataset.name) ?? '';
      const blob = new Blob([content], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: btn.dataset.name }).click();
      URL.revokeObjectURL(url);
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// VARIABLE WATCH
// ══════════════════════════════════════════════════════════════════════════════

function updateWatchWindow(snapshot) {
  if (!variableWatch) return;
  const entries = Object.entries(snapshot);
  if (!entries.length) {
    variableWatch.innerHTML = '<div class="watch-empty">No variables yet.</div>';
    return;
  }
  variableWatch.innerHTML = `
    <table class="watch-table">
      <thead><tr><th>Name</th><th>Value</th></tr></thead>
      <tbody>
        ${entries.map(([k, v]) =>
          `<tr><td class="watch-name">${escHtml(k)}</td><td class="watch-val">${escHtml(String(v ?? '∅'))}</td></tr>`
        ).join('')}
      </tbody>
    </table>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// RUN / DEBUG
// ══════════════════════════════════════════════════════════════════════════════

// Returns true if the program was successfully saved (or already saved)
async function forceSaveBeforeRun() {
  let title = currentTitle.replace(/^\* /, '');
  if (!title || title === 'Untitled Program') {
    const given = prompt('You must name your program before running it:');
    if (!given?.trim()) return false;
    title = given.trim();
    setTitle(title);
  }

  appendOutput('// Saving…');
  try {
    const source = editor.getValue();
    if (!currentProgramId) {
      currentProgramId = await saveNewProgram(currentUser.uid, { title, source });
    } else {
      await updateProgram(currentProgramId, { title, source });
    }
    isDirty = false;
    setTitle(title);
    setSaveStatus('✓ Saved');
    updateTabState();
    setTimeout(() => setSaveStatus(''), 2000);
    await refreshProgramList();

    // Remove the "Saving…" line
    const savingLine = outputConsole?.querySelector('.output-line:last-child');
    if (savingLine?.textContent === '// Saving…') savingLine.remove();

    return true;
  } catch (e) {
    showSaveError('Save failed: ' + (e.message ?? e));
    return false;
  }
}

async function runProgram(debugMode = false) {
  if (isRunning) return;

  // Challenge exercises are auto-saved — no save prompt needed
  if (!challenges.isActive()) {
    if (isDirty || !currentProgramId) {
      const ok = await forceSaveBeforeRun();
      if (!ok) return;
    }
  }

  clearOutput();
  switchToConsoleTab();
  editor.clearErrorLine();
  editor.clearExecutingLine();

  isRunning    = true;
  stepCount    = 0;
  runStartTime = Date.now();

  setRunningUI(true, debugMode);
  setStatusRunning(debugMode ? 'debugging' : 'running');

  interp.reset();
  interp.setBreakpoints(editor.getBreakpoints());
  interp.debugMode = debugMode;
  interp.stepMode  = debugMode;

  if (debugMode) {
    debugPanel?.classList.remove('hidden');
    if (debugStatus) debugStatus.textContent = 'Running';
    if (debugSteps)  debugSteps.textContent  = '0';
  }

  interp.onOutput = line => appendOutput(line);

  interp.onLineChange = lineNo => {
    editor.setExecutingLine(lineNo);
    if (debugCurrentLine) debugCurrentLine.textContent = lineNo;
    stepCount++;
    if (debugSteps) debugSteps.textContent = stepCount;
  };

  interp.onVarsChange   = snapshot => updateWatchWindow(snapshot);
  interp.onFilesChange  = filesMap => renderVirtualFiles(filesMap);
  interp.onInputRequest = varName  => promptInput(varName);

  // If the active exercise has a hidden prelude (e.g. pre-populated array),
  // interleave it: student DECLAREs first, then prelude, then the rest of the code.
  let runSource = editor.getValue();
  const exercisePrelude = challenges.currentExercise?.preludeTestOnly ? '' : challenges.currentExercise?.prelude;
  let preludeLineOffset = 0;
  if (exercisePrelude) {
    const lines = runSource.split('\n');
    const declLines = lines.filter(l => /^\s*DECLARE\b/i.test(l));
    const restLines = lines.filter(l => !/^\s*DECLARE\b/i.test(l));
    runSource = [...declLines, exercisePrelude, ...restLines].join('\n');
    preludeLineOffset = exercisePrelude.split('\n').length;
  }

  const adjustLine = n => (preludeLineOffset > 0 && n > preludeLineOffset) ? n - preludeLineOffset : n;

  interp.onError = err => {
    const line = adjustLine(err.pseudoLine ?? interp._currentLine);
    showErrors([{ message: err.message, line }]);
  };

  const relaxedIdentifiers = challenges.currentExercise?.category === 'exam';
  await interp.run(runSource, { debug: debugMode, stepMode: debugMode, relaxedIdentifiers });

  try {
    if (currentUser && currentProfile?.role === 'student') {
      await saveSession(currentUser.uid, {
        programId:   currentProgramId,
        source:      editor.getValue(),
        mode:        debugMode ? 'debug' : 'run',
        errors:      interp.getErrors(),
        constructs:  interp.getConstructs(),
        durationMs:  Date.now() - runStartTime,
        outputLines: interp.outputLines.length
      });
    }
  } catch { /* analytics failure is non-fatal */ }

  const errors = interp.getErrors().map(e => ({ ...e, line: adjustLine(e.line) }));
  if (errors.length) showErrors(errors);
  const files = interp.getFiles();
  if (Object.keys(files).length) renderVirtualFiles(files);

  editor.clearExecutingLine();
  if (debugStatus) debugStatus.textContent = 'Finished';
  isRunning = false;
  setRunningUI(false, debugMode);
  setStatusRunning(null);

  // Auto-evaluate challenge tests when running in challenge mode (not debug)
  if (!debugMode && challenges.isActive()) {
    await challenges.runTests();
  }
}

function setRunningUI(running, debugMode) {
  if (runBtn)      runBtn.disabled   = running;
  if (debugBtn)    debugBtn.disabled = running;
  if (stopBtn)     { stopBtn.classList.toggle('hidden', !running); stopBtn.disabled = !running; }
  if (stepBtn)     { stepBtn.classList.toggle('hidden',     !(running && debugMode)); stepBtn.disabled = !running; }
  if (continueBtn) { continueBtn.classList.toggle('hidden', !(running && debugMode)); continueBtn.disabled = !running; }
}

function setStatusRunning(mode) {
  if (!statusBar) return;
  statusBar.classList.remove('is-running', 'is-debugging', 'is-paused');
  if (mode === 'running')   statusBar.classList.add('is-running');
  if (mode === 'debugging') statusBar.classList.add('is-debugging');
  if (mode === 'paused')    statusBar.classList.add('is-paused');
  if (statusExecState) statusExecState.textContent = mode
    ? (mode === 'running' ? '▶ Running' : mode === 'debugging' ? '⬤ Debugging' : '⏸ Paused')
    : '';
}

function stopProgram() {
  interp.debugMode = false;
  interp.stepMode  = false;
  interp.step();
  interp._stopped  = true;
  isRunning = false;
  setRunningUI(false, false);
  setStatusRunning(null);
  editor.clearExecutingLine();
  if (debugStatus) debugStatus.textContent = 'Stopped';
}

// Patch interpreter to honour _stopped flag
const _origPause = interp._pauseIfNeeded.bind(interp);
interp._pauseIfNeeded = async function(line) {
  if (this._stopped) throw new RuntimeError('Execution stopped by user', line);
  return _origPause(line);
};

runBtn?.addEventListener('click',      () => runProgram(false));
debugBtn?.addEventListener('click',    () => runProgram(true));
stopBtn?.addEventListener('click',     stopProgram);
stepBtn?.addEventListener('click',     () => { interp.step(); setStatusRunning('paused'); });
continueBtn?.addEventListener('click', () => { interp.stepMode = false; interp.step(); setStatusRunning('debugging'); });

// ══════════════════════════════════════════════════════════════════════════════
// INLINE CONSOLE INPUT
// ══════════════════════════════════════════════════════════════════════════════

function promptInput(varName) {
  return new Promise(resolve => {
    switchToConsoleTab();
    const placeholder = outputConsole?.querySelector('.output-placeholder');
    if (placeholder) placeholder.remove();

    const row = document.createElement('div');
    row.className = 'console-input-row';
    row.innerHTML =
      `<span class="console-input-prompt">&gt; ${escHtml(varName)}: </span>` +
      `<input type="text" class="console-input-field" autocomplete="off" spellcheck="false">`;
    outputConsole?.appendChild(row);
    if (outputConsole) outputConsole.scrollTop = outputConsole.scrollHeight;

    const field = row.querySelector('.console-input-field');
    field.focus();

    const finish = () => {
      const val = field.value;
      field.disabled = true;
      // Show the submitted value as a normal line next to the prompt
      row.innerHTML = `<span class="console-input-prompt">&gt; ${escHtml(varName)}: </span><span style="color:var(--syn-str)">${escHtml(val)}</span>`;
      if (outputConsole) outputConsole.scrollTop = outputConsole.scrollHeight;
      resolve(val);
    };

    field.addEventListener('keydown', e => { if (e.key === 'Enter') finish(); });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// DRAGGABLE PANEL RESIZE
// ══════════════════════════════════════════════════════════════════════════════

let _resizing = false;
let _resizeStartY = 0;
let _resizeStartH = 0;

resizeHandle?.addEventListener('mousedown', e => {
  _resizing     = true;
  _resizeStartY = e.clientY;
  _resizeStartH = outputPanel.offsetHeight;
  resizeHandle.classList.add('dragging');
  document.body.style.cursor = 'row-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', e => {
  if (!_resizing) return;
  const delta    = _resizeStartY - e.clientY;  // drag up = larger panel
  const newH     = Math.max(60, Math.min(window.innerHeight * 0.7, _resizeStartH + delta));
  outputPanel.style.height = newH + 'px';
});

document.addEventListener('mouseup', () => {
  if (_resizing) {
    _resizing = false;
    resizeHandle?.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// THEME TOGGLE  (now in status bar)
// ══════════════════════════════════════════════════════════════════════════════

themeToggleBtn?.addEventListener('click', () => {
  const html    = document.documentElement;
  const isLight = html.dataset.theme === 'light';
  html.dataset.theme = isLight ? 'dark' : 'light';
  updateThemeIcons(!isLight);
  localStorage.setItem('theme', html.dataset.theme);
});

function updateThemeIcons(isDark) {
  themeIconDark?.classList.toggle('hidden',  isDark);
  themeIconLight?.classList.toggle('hidden', !isDark);
  if (themeLabel) themeLabel.textContent = isDark ? 'Dark' : 'Light';
}

(function restoreTheme() {
  const saved = localStorage.getItem('theme') ?? 'light';
  document.documentElement.dataset.theme = saved;
  updateThemeIcons(saved === 'dark');
})();

// ══════════════════════════════════════════════════════════════════════════════
// FONT TOGGLE  (now in status bar)
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// EXPLORER PANEL TOGGLE
// ══════════════════════════════════════════════════════════════════════════════

function setExplorer(open) {
  sidebar?.classList.toggle('sidebar--open', open);
  explorerBtn?.classList.toggle('active', open);
  localStorage.setItem('explorerOpen', open ? '1' : '0');
}

explorerBtn?.addEventListener('click', () => {
  setExplorer(!sidebar?.classList.contains('sidebar--open'));
});

explorerCloseBtn?.addEventListener('click', () => setExplorer(false));

// Restore panel state — default open
(function restoreExplorer() {
  const saved = localStorage.getItem('explorerOpen');
  const open = saved === null ? true : saved === '1';
  setExplorer(open);
})();

// ══════════════════════════════════════════════════════════════════════════════
// REFERENCE PANEL TOGGLE
// ══════════════════════════════════════════════════════════════════════════════

function setRefPanel(open) {
  refPanel?.classList.toggle('ref-panel--open', open);
  refPanelBtn?.classList.toggle('active', open);
  localStorage.setItem('refPanelOpen', open ? '1' : '0');
}

refPanelBtn?.addEventListener('click', () => {
  setRefPanel(!refPanel?.classList.contains('ref-panel--open'));
});

refCloseBtn?.addEventListener('click', () => setRefPanel(false));

// Restore panel state — default open
(function restoreRefPanel() {
  const saved = localStorage.getItem('refPanelOpen');
  const open = saved === null ? true : saved === '1';
  setRefPanel(open);
})();

fontToggleBtn?.addEventListener('click', () => {
  const html       = document.documentElement;
  const isDyslexic = html.dataset.font === 'dyslexic';
  html.dataset.font = isDyslexic ? '' : 'dyslexic';
  fontToggleBtn.classList.toggle('active', !isDyslexic);
  localStorage.setItem('font', html.dataset.font);
});

(function restoreFont() {
  const saved = localStorage.getItem('font');
  if (saved === 'dyslexic') {
    document.documentElement.dataset.font = 'dyslexic';
    fontToggleBtn?.classList.add('active');
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

// ── Re-validate submissions ───────────────────────────────────────────────────
const revalidateBtn    = $('btn-revalidate');
const revalidateStatus = $('revalidate-status');
revalidateBtn?.addEventListener('click', async () => {
  if (!confirm('Re-run all saved student submissions against the current test cases?\n\nAny completions that no longer pass will be unchecked and their XP deducted.')) return;
  revalidateBtn.disabled    = true;
  revalidateBtn.textContent = 'Running…';
  revalidateStatus.textContent = '';
  try {
    const count = await revalidateAllSubmissions(revalidateStatus);
    revalidateStatus.textContent = count === 0
      ? '✓ All submissions still valid'
      : `✓ Done — ${count} completion${count === 1 ? '' : 's'} removed`;
    if (count > 0) refreshDashboard();
  } catch (e) {
    revalidateStatus.textContent = `✗ Error: ${e.message}`;
  } finally {
    revalidateBtn.disabled    = false;
    revalidateBtn.textContent = '✓ Re-validate submissions';
  }
});

// ── Dashboard theme ──────────────────────────────────────────────────────────
const dashThemeBtn = $('btn-dash-theme');
function _applyDashTheme(theme) {
  if (!teacherDash) return;
  if (theme === 'light') {
    teacherDash.setAttribute('data-dash-theme', 'light');
    if (dashThemeBtn) dashThemeBtn.textContent = '☽ Dark';
  } else {
    teacherDash.removeAttribute('data-dash-theme');
    if (dashThemeBtn) dashThemeBtn.textContent = '☀ Light';
  }
}
// Restore saved preference
_applyDashTheme(localStorage.getItem('dashTheme') ?? 'dark');

dashThemeBtn?.addEventListener('click', () => {
  const isDark = !teacherDash.hasAttribute('data-dash-theme');
  const next = isDark ? 'light' : 'dark';
  localStorage.setItem('dashTheme', next);
  _applyDashTheme(next);
});

dashboardBtn?.addEventListener('click', async () => {
  teacherDash?.classList.remove('hidden');
  _applyDashTheme(localStorage.getItem('dashTheme') ?? 'dark');
  if (dashboardGrid) await renderDashboard(dashboardGrid);
});
closeDashBtn?.addEventListener('click', () => teacherDash?.classList.add('hidden'));

// ══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS
// ══════════════════════════════════════════════════════════════════════════════

editor.onBreakpoint(bpSet => interp.setBreakpoints(bpSet));

// ══════════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════════════════════════════════════

document.addEventListener('keydown', e => {
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && e.key === 's')  { e.preventDefault(); saveProgram(); return; }
  if (e.key === 'F5')         { e.preventDefault(); isRunning ? (interp.stepMode = false, interp.step()) : runProgram(false); return; }
  if (e.key === 'F6')         { e.preventDefault(); if (!isRunning) runProgram(true); return; }
  if (e.key === 'F10')        { e.preventDefault(); interp.step(); return; }
  if (e.key === 'Escape') {
    if (isRunning) stopProgram();
    renameModal?.classList.add('hidden');
    classModal?.classList.add('hidden');
    document.getElementById('sg-modal-request')?.classList.add('hidden');
    document.getElementById('sg-modal-error')?.classList.add('hidden');
    document.getElementById('sg-modal-inbox')?.classList.add('hidden');
    return;
  }
});

// ── Suggestions UI (static listeners, called once) ────────────────────────────
setupSuggestionsUI();

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function show(el) { el?.classList.remove('hidden'); }
function hide(el) { el?.classList.add('hidden'); }

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
