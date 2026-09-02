// ==========================================================================
// Aachico Vault - Legal Documents & 15-Day Expiry Radar Module
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * गाड़ी के 6 लीगल पेपर्स (RC, Insurance, PUC, Fitness, Permit, Tax) रजिस्टर करना
 */
export async function registerLegalDocument(docData) {
  try {
    const docRef = await addDoc(collection(db, "legal_documents"), {
      vehicleNumber: docData.vehicleNumber,
      documentType: docData.documentType, // e.g., Insurance, PUC, RC, Fitness
      expiryDate: docData.expiryDate,
      documentUrl: docData.documentUrl || "",
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "लीगल डॉक्यूमेंट सफलतापूर्वक सेव हो गया है!" };
  } catch (error) {
    console.error("Error saving legal document: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * सभी लीगल पेपर्स की सूची लोड करना और 15-दिन एक्सपायरी रडार चेक करना
 */
export async function fetchLegalDocuments() {
  try {
    const q = query(collection(db, "legal_documents"), orderBy("expiryDate", "asc"));
    const querySnapshot = await getDocs(q);
    
    let docsList = [];
    const today = new Date();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const expiry = new Date(data.expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let alertStatus = "Valid";
      if (diffDays < 0) {
        alertStatus = "Expired";
      } else if (diffDays <= 15) {
        alertStatus = "Expiring Soon (15 Days Radar)";
      }

      docsList.push({ id: docSnap.id, ...data, remainingDays: diffDays, alertStatus });
    });

    return { success: true, data: docsList };
  } catch (error) {
    console.error("Error fetching legal documents: ", error);
    return { success: false, error: error.message, data: [] };
  }
}
