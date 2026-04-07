// ─── Firebase Configuration ─────────────────────────────────────────────────
// Replace the placeholder values below with your actual Firebase project config.
// Find these in: Firebase Console → Project Settings → Your apps → SDK setup

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth }        from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore }   from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAXMM8Y4_n2DHxJu2k5uMqYd9LRZYCkeCg",
  authDomain: "as-pseudolab.firebaseapp.com",
  projectId: "as-pseudolab",
  storageBucket: "as-pseudolab.firebasestorage.app",
  messagingSenderId: "556717877751",
  appId: "1:556717877751:web:24e74de4c519db490166f2"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export { app, auth, db };
