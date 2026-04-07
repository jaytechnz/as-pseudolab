// ─── Authentication ──────────────────────────────────────────────────────────
// Handles Firebase Auth sign-in, registration, and sign-out.
// Domain policy:
//   @cga.school          → role: teacher
//   @student.cga.school  → role: student
// All other domains are rejected at registration time.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

import { auth, db } from './firebase-config.js';

// ─── Domain helpers ──────────────────────────────────────────────────────────

function domainOf(email) {
  return email.split('@')[1]?.toLowerCase() ?? '';
}

// Accounts that are automatically provisioned as superadmin at registration.
// After registering, Firestore will hold role: 'superadmin' for these emails.
const SUPERADMIN_EMAILS = new Set([
  'j.smith@cga.school',
]);

function roleForDomain(domain) {
  if (domain === 'cga.school')         return 'teacher';
  if (domain === 'student.cga.school') return 'student';
  return null;
}

function roleForEmail(email) {
  if (SUPERADMIN_EMAILS.has(email.toLowerCase())) return 'superadmin';
  return roleForDomain(domainOf(email));
}

function validateDomain(email) {
  const role = roleForDomain(domainOf(email));
  if (!role) {
    throw new Error(
      'Only @cga.school (teachers) and @student.cga.school (students) may register.'
    );
  }
  return role;
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerUser(email, password, displayName, classCode = '') {
  validateDomain(email); // still enforces domain restriction
  const role = roleForEmail(email);

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  await setDoc(doc(db, 'users', cred.user.uid), {
    uid:         cred.user.uid,
    email,
    displayName,
    role,
    classCode:   role === 'student' ? (classCode.trim().toUpperCase() || '') : '',
    createdAt:   serverTimestamp(),
    lastLoginAt: serverTimestamp()
  });

  return { user: cred.user, role };
}

// Update a student's class code without re-registering
export async function updateUserClassCode(uid, classCode) {
  await updateDoc(doc(db, 'users', uid), {
    classCode: classCode.trim().toUpperCase()
  });
}

// ─── Sign in ─────────────────────────────────────────────────────────────────

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  const role = roleForEmail(email);

  // Refresh lastLoginAt; also patch role in case account pre-dates superadmin list
  const updates = { lastLoginAt: serverTimestamp() };
  if (SUPERADMIN_EMAILS.has(email.toLowerCase())) updates.role = 'superadmin';
  await setDoc(doc(db, 'users', cred.user.uid), updates, { merge: true });

  return { user: cred.user, role };
}

// ─── Sign out ────────────────────────────────────────────────────────────────

export async function signOutUser() {
  await signOut(auth);
}

// ─── Password reset ──────────────────────────────────────────────────────────

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ─── Get user profile (Firestore) ────────────────────────────────────────────

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ─── Auth state listener ─────────────────────────────────────────────────────
// callback(user, profile | null)  — profile includes role

export function onAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) { callback(null, null); return; }
    const profile = await getUserProfile(user.uid);
    callback(user, profile);
  });
}
