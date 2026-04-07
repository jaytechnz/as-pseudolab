// ─── Firestore Storage ────────────────────────────────────────────────────────
// Collections:
//   users/{uid}                  — profile (created by auth.js)
//   programs/{progId}            — program documents
//   sessions/{sessionId}         — run/debug session analytics

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

import { db } from './firebase-config.js';

// ══════════════════════════════════════════════════════════════════════════════
// PROGRAMS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Save a new program.
 * Returns the new document ID.
 */
export async function saveNewProgram(uid, { title, source }) {
  const ref = await addDoc(collection(db, 'programs'), {
    uid,
    title:     title || 'Untitled',
    source,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

/**
 * Overwrite an existing program's source (and optionally title).
 */
export async function updateProgram(programId, { title, source }) {
  const updates = { source, updatedAt: serverTimestamp() };
  if (title !== undefined) updates.title = title;
  await updateDoc(doc(db, 'programs', programId), updates);
}

/**
 * Load a single program by ID.
 */
export async function loadProgram(programId) {
  const snap = await getDoc(doc(db, 'programs', programId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * List all programs belonging to a user, newest first.
 * Sorting is done client-side to avoid needing a Firestore composite index.
 */
export async function listPrograms(uid) {
  const q = query(
    collection(db, 'programs'),
    where('uid', '==', uid)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) => {
    const ta = a.updatedAt?.toMillis?.() ?? a.updatedAt ?? 0;
    const tb = b.updatedAt?.toMillis?.() ?? b.updatedAt ?? 0;
    return tb - ta;
  });
  return docs;
}

/**
 * Delete a program.
 */
export async function deleteProgram(programId) {
  await deleteDoc(doc(db, 'programs', programId));
}

/**
 * Rename a program.
 */
export async function renameProgram(programId, newTitle) {
  await updateDoc(doc(db, 'programs', programId), {
    title:     newTitle,
    updatedAt: serverTimestamp()
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SESSIONS  (analytics)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Record a run/debug session with analytics data.
 *
 * @param {object} opts
 *   uid          — student uid
 *   programId    — program ref (may be null for unsaved programs)
 *   source       — the pseudocode text run
 *   mode         — 'run' | 'debug'
 *   errors       — array of { message, line }
 *   constructs   — array of construct names used (IF, FOR, etc.)
 *   durationMs   — time in ms from run start to completion/error
 *   outputLines  — number of OUTPUT lines produced
 */
export async function saveSession(uid, {
  programId    = null,
  source       = '',
  mode         = 'run',
  errors       = [],
  constructs   = [],
  durationMs   = 0,
  outputLines  = 0
} = {}) {
  await addDoc(collection(db, 'sessions'), {
    uid,
    programId,
    mode,
    errors,
    errorCount:   errors.length,
    constructs,
    durationMs,
    outputLines,
    linesOfCode:  source.split('\n').filter(l => l.trim()).length,
    timestamp:    serverTimestamp()
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER DASHBOARD DATA
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all student profiles (role == 'student').
 */
export async function getAllStudents() {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch all sessions, optionally filtered by uid.
 * Returns up to maxCount, newest first.
 */
export async function getSessions({ uid = null, maxCount = 500 } = {}) {
  const q = uid
    ? query(collection(db, 'sessions'), where('uid', '==', uid), limit(maxCount))
    : query(collection(db, 'sessions'), limit(maxCount));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) => {
    const ta = a.timestamp?.toMillis?.() ?? a.timestamp ?? 0;
    const tb = b.timestamp?.toMillis?.() ?? b.timestamp ?? 0;
    return tb - ta;
  });
  return docs;
}

/**
 * Aggregate sessions into per-student analytics.
 * Returns a map: uid → { totalSessions, errorRate, constructs, avgDuration, ... }
 */
export function aggregateAnalytics(sessions, students) {
  const byUid = {};

  for (const s of sessions) {
    if (!byUid[s.uid]) {
      byUid[s.uid] = {
        sessions:      0,
        totalErrors:   0,
        totalDuration: 0,
        constructsUsed: new Set(),
        errorTypes:    {}
      };
    }
    const a = byUid[s.uid];
    a.sessions++;
    a.totalErrors   += s.errorCount ?? 0;
    a.totalDuration += s.durationMs ?? 0;
    (s.constructs ?? []).forEach(c => a.constructsUsed.add(c));
    (s.errors ?? []).forEach(e => {
      const key = categoriseError(e.message);
      a.errorTypes[key] = (a.errorTypes[key] ?? 0) + 1;
    });
  }

  const result = [];
  for (const stu of students) {
    const a = byUid[stu.uid] ?? {
      sessions: 0, totalErrors: 0, totalDuration: 0,
      constructsUsed: new Set(), errorTypes: {}
    };
    const errorRate = a.sessions > 0
      ? (a.totalErrors / a.sessions).toFixed(1)
      : '0';

    result.push({
      uid:           stu.uid,
      displayName:   stu.displayName,
      email:         stu.email,
      classCode:     stu.classCode ?? '',
      sessions:      a.sessions,
      errorRate:     parseFloat(errorRate),
      avgDuration:   a.sessions > 0 ? Math.round(a.totalDuration / a.sessions) : 0,
      constructs:    [...a.constructsUsed],
      errorTypes:    a.errorTypes,
      skills:        computeSkills(a)
    });
  }

  return result;
}

// ── Error categorisation ─────────────────────────────────────────────────────

function categoriseError(message) {
  const m = (message ?? '').toLowerCase();
  if (m.includes('syntax') || m.includes('expected') || m.includes('unexpected'))
    return 'Syntax';
  if (m.includes('undefined') || m.includes('not declared'))
    return 'Undefined variable';
  if (m.includes('division') || m.includes('divide'))
    return 'Division by zero';
  if (m.includes('array') || m.includes('index'))
    return 'Array bounds';
  if (m.includes('type') || m.includes('expected number'))
    return 'Type mismatch';
  if (m.includes('file') || m.includes('eof'))
    return 'File error';
  return 'Runtime';
}

// ══════════════════════════════════════════════════════════════════════════════
// CHALLENGE PROGRESS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Load a student's challenge progress document.
 * Returns null if none exists yet.
 */
export async function getChallengeProgress(uid) {
  const snap = await getDoc(doc(db, 'challenge_progress', uid));
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Save (overwrite) a student's challenge progress document.
 * data: { completed: {id: {completedAt, xp}}, totalXP, badges }
 */
export async function saveChallengeProgress(uid, data) {
  await setDoc(doc(db, 'challenge_progress', uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/**
 * Fetch all students' challenge progress (for teacher dashboard).
 * Returns { uid: { completed, totalXP, badges, submissions } }
 */
export async function getAllChallengeProgress() {
  const snap = await getDocs(collection(db, 'challenge_progress'));
  const result = {};
  snap.docs.forEach(d => { result[d.id] = d.data(); });
  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// Public summary per user — readable by all authenticated users.
// Stores no code; only rank-relevant data.
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Write / update this user's leaderboard entry.
 */
export async function updateLeaderboard(uid, { displayName, classCode, role = 'student', totalXP, completedCount, level, badgeCount }) {
  await setDoc(doc(db, 'leaderboard', uid), {
    uid, displayName, classCode: classCode ?? '', role, totalXP, completedCount, level, badgeCount,
    updatedAt: serverTimestamp()
  });
}

/**
 * Fetch all leaderboard entries for a given class code.
 * Returns array sorted by totalXP descending.
 */
export async function getClassLeaderboard(classCode) {
  if (!classCode) return [];
  const q = query(
    collection(db, 'leaderboard'),
    where('classCode', '==', classCode)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => d.data());
  docs.sort((a, b) => b.totalXP - a.totalXP || b.completedCount - a.completedCount);
  return docs;
}

/**
 * Fetch all leaderboard entries (for teacher class picker).
 */
export async function getAllLeaderboardEntries() {
  const snap = await getDocs(collection(db, 'leaderboard'));
  return snap.docs.map(d => d.data());
}

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER FEEDBACK
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Save (or overwrite) a teacher's feedback comment on a student's exercise.
 * Document ID: `${studentUid}_${exId}`
 */
// ══════════════════════════════════════════════════════════════════════════════
// CLASS NAMES  (friendly names for class codes)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all class name mappings.
 * Returns { classCode: friendlyName }
 */
export async function getClassNames() {
  const snap = await getDocs(collection(db, 'class_names'));
  const result = {};
  snap.docs.forEach(d => { result[d.id] = d.data().name ?? d.id; });
  return result;
}

/**
 * Save a friendly name for a class code.
 */
export async function saveClassName(classCode, name) {
  await setDoc(doc(db, 'class_names', classCode), { name, updatedAt: serverTimestamp() });
}

export async function saveTeacherFeedback(studentUid, exId, comment) {
  const docId = `${studentUid}_${exId}`;
  await setDoc(doc(db, 'teacher_feedback', docId), {
    studentUid,
    exId,
    comment,
    updatedAt: serverTimestamp()
  });
}

/**
 * Fetch all teacher feedback documents.
 * Returns { studentUid: { exId: comment } }
 */
export async function getAllTeacherFeedback() {
  const snap = await getDocs(collection(db, 'teacher_feedback'));
  const result = {};
  snap.docs.forEach(d => {
    const { studentUid, exId, comment } = d.data();
    if (!result[studentUid]) result[studentUid] = {};
    result[studentUid][exId] = comment;
  });
  return result;
}

// ── Skill scoring ────────────────────────────────────────────────────────────
// Returns { algorithmDesign, computationalThinking, pseudocodeSyntax }
// Each is 0–100.

const ALGORITHM_CONSTRUCTS = ['FOR','WHILE','REPEAT','IF','CASE'];
const CT_CONSTRUCTS         = ['PROCEDURE','FUNCTION','ARRAY','DECLARE'];

function computeSkills(agg) {
  const c = agg.constructsUsed;

  // Algorithm design: breadth of loop + selection constructs
  const algCount = ALGORITHM_CONSTRUCTS.filter(x => c.has(x)).length;
  const algorithmDesign = Math.min(100, (algCount / ALGORITHM_CONSTRUCTS.length) * 100);

  // Computational thinking: use of abstraction (procedures/functions) + data structures
  const ctCount = CT_CONSTRUCTS.filter(x => c.has(x)).length;
  const computationalThinking = Math.min(100, (ctCount / CT_CONSTRUCTS.length) * 100);

  // Pseudocode syntax accuracy: inverse error rate (cap at 5 errors/session = 0%)
  const errorRate = agg.sessions > 0 ? agg.totalErrors / agg.sessions : 0;
  const pseudocodeSyntax = Math.max(0, 100 - (errorRate / 5) * 100);

  return {
    algorithmDesign:     Math.round(algorithmDesign),
    computationalThinking: Math.round(computationalThinking),
    pseudocodeSyntax:    Math.round(pseudocodeSyntax)
  };
}
