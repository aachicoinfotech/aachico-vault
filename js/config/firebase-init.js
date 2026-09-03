// ==========================================================================
// Aachico Vault - Central Firebase Initialization & Hybrid Storage
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

/**
 * हाइब्रिड स्टोरेज हेल्पर: LocalStorage (इंस्टेंट ऑफलाइन) + Firebase Sync
 */
export const HybridStorage = {
  saveLocal: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Localstorage quota error:", e);
      return false;
    }
  },
  getLocal: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Localstorage read error:", e);
      return null;
    }
  }
};

export { db, app };
