// ==========================================================================
// Aachico Vault - Central Firebase Initialization & Firestore Instance
// ==========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOIEKyvSwfpRybZBmNuImzdJ3hdlEO3hI",
  authDomain: "aachico-vault.firebaseapp.com",
  projectId: "aachico-vault",
  storageBucket: "aachico-vault.firebasestorage.app",
  messagingSenderId: "766953520082",
  appId: "1:766953520082:web:481f1aab82b74d78aae60b"
};

// Initialize Firebase App & Firestore Database Instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };
