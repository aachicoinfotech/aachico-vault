/* js/config/firebase-init.js */
/* ==========================================================================
   Aachico Vault - Central Firebase Initialization & Hybrid Storage (Phase 1 Final)
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

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
const auth = getAuth(app);

// Enable offline persistence for Firestore if supported
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
  } else if (err.code === 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable persistence.");
  }
});

/**
 * हाइब्रिड स्टोरेज हेल्पर: LocalStorage (इंस्टेंट ऑफलाइन) + Firebase Sync & Queue
 */
class HybridStorageEngine {
  constructor() {
    this.isOnline = navigator.onLine;
    this.initNetworkListeners();
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log("%c[Network] Online - Triggering Sync Queue...", "color: #10b981; font-weight: bold;");
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.warn("%c[Network] Offline - Falling back to LocalStorage.", "color: #f43f5e; font-weight: bold;");
    });
  }

  saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Localstorage quota error:", e);
      this.handleStorageEviction();
      return false;
    }
  }

  getLocal(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Localstorage read error:", e);
      return null;
    }
  }

  // Tenant-wise Hybrid Save: Local First + Cloud Sync with Queue Backup
  async setItem(companyId, collectionName, docId, data) {
    const storageKey = `aachico_${companyId}_${collectionName}_${docId}`;
    
    // 1. Instant Local Save (Offline-First)
    this.saveLocal(storageKey, {
      payload: data,
      updatedAt: new Date().toISOString(),
      synced: false
    });

    // 2. Cloud Sync if Online
    if (this.isOnline) {
      try {
        const docRef = doc(db, `companies/${companyId}/${collectionName}`, docId);
        await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
        
        // Mark as synced locally
        this.saveLocal(storageKey, {
          payload: data,
          updatedAt: new Date().toISOString(),
          synced: true
        });
      } catch (error) {
        console.error("Cloud sync failed, added to pending queue:", error);
        this.addToSyncQueue(companyId, collectionName, docId, data);
      }
    } else {
      this.addToSyncQueue(companyId, collectionName, docId, data);
    }
  }

  addToSyncQueue(companyId, collectionName, docId, data) {
    let queue = JSON.parse(localStorage.getItem('aachico_sync_queue') || '[]');
    queue.push({ companyId, collectionName, docId, data, timestamp: Date.now() });
    localStorage.setItem('aachico_sync_queue', JSON.stringify(queue));
  }

  async processSyncQueue() {
    let queue = JSON.parse(localStorage.getItem('aachico_sync_queue') || '[]');
    if (queue.length === 0) return;

    let remainingQueue = [];
    for (const item of queue) {
      try {
        const docRef = doc(db, `companies/${item.companyId}/${item.collectionName}`, item.docId);
        await setDoc(docRef, { ...item.data, updatedAt: new Date().toISOString() }, { merge: true });
        console.log(`Synced queued item: ${item.docId}`);
      } catch (err) {
        console.error(`Failed to sync item ${item.docId}:`, err);
        remainingQueue.push(item);
      }
    }
    localStorage.setItem('aachico_sync_queue', JSON.stringify(remainingQueue));
  }

  handleStorageEviction() {
    console.warn("Managing LocalStorage eviction: clearing old cached logs...");
  }
}

export const HybridStorage = new HybridStorageEngine();
export { db, app, auth, doc, setDoc, getDoc };
