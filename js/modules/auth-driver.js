// ==========================================================================
// Aachico Vault - Driver 4-Digit PIN Authentication Module
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * ड्राइवर के 4-डिजिट पिन को वेरीफाई करना
 */
export async function authenticateDriverPin(phoneNumber, enteredPin) {
  try {
    const q = query(
      collection(db, "drivers"),
      where("phoneNumber", "==", phoneNumber),
      where("driverPin", "==", String(enteredPin))
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: "गलत फोन नंबर या 4-डिजिट पिन!" };
    }

    let driverData = null;
    querySnapshot.forEach((doc) => {
      driverData = { id: doc.id, ...doc.data() };
    });

    // ड्राइवर सेशन लोकल स्टोरेज में सेव करना
    localStorage.setItem("aachico_driver_session", JSON.stringify(driverData));

    return { success: true, data: driverData, message: "ड्राइवर लॉगिन सफल!" };
  } catch (error) {
    console.error("Driver PIN auth error: ", error);
    return { success: false, error: error.message };
  }
}

/**
     * चेक करना कि ड्राइवर लॉगिन है या नहीं
     */
export function checkDriverSession() {
  const session = localStorage.getItem("aachico_driver_session");
  if (!session) return null;
  return JSON.parse(session);
}

/**
 * ड्राइवर लॉगआउट
 */
export function driverLogout() {
  localStorage.removeItem("aachico_driver_session");
  window.location.href = "driver.html";
}
